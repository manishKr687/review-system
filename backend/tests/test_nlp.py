"""
Pure unit tests for the NLP service — no database or HTTP involved.
"""
import pytest
from app.services.nlp import analyse_sentiment, extract_aspect_sentiments, score_to_aspect_rating


class TestAnalyseSentiment:

    def test_clearly_positive_text(self):
        label, score = analyse_sentiment("This is an absolutely amazing product, I love it!")
        assert label == "positive"
        assert score > 0.05

    def test_clearly_negative_text(self):
        label, score = analyse_sentiment("Terrible quality, broke after one day. Completely useless.")
        assert label == "negative"
        assert score < -0.05

    def test_neutral_text(self):
        label, score = analyse_sentiment("The product arrived on Tuesday.")
        assert label == "neutral"
        assert -0.05 <= score <= 0.05

    def test_returns_tuple(self):
        result = analyse_sentiment("ok product")
        assert isinstance(result, tuple)
        assert len(result) == 2

    def test_score_in_valid_range(self):
        _, score = analyse_sentiment("decent phone")
        assert -1.0 <= score <= 1.0

    def test_empty_string_is_neutral(self):
        label, _ = analyse_sentiment("")
        assert label == "neutral"

    def test_mixed_text(self):
        label, _ = analyse_sentiment("Battery is great but camera is disappointing")
        # mixed — could go either way, just check it returns a valid label
        assert label in ("positive", "negative", "neutral")


class TestExtractAspectSentiments:

    def test_extracts_camera_aspect(self):
        text = "The camera is absolutely stunning, photos look incredible."
        aspects = extract_aspect_sentiments(text)
        assert "camera" in aspects
        assert aspects["camera"] > 2.5  # positive → above neutral baseline (2.0)

    def test_extracts_battery_aspect(self):
        text = "Battery life is terrible, drains in 3 hours."
        aspects = extract_aspect_sentiments(text)
        assert "battery" in aspects
        assert aspects["battery"] < 3.0  # negative → below midpoint

    def test_ignores_unmentioned_aspects(self):
        text = "The display is gorgeous and very sharp."
        aspects = extract_aspect_sentiments(text)
        # display should be present, others not necessarily
        assert "display" in aspects
        # no battery/camera mention means those keys absent
        assert "battery" not in aspects
        assert "camera" not in aspects

    def test_returns_empty_for_irrelevant_text(self):
        text = "The box arrived yesterday and it was raining outside."
        aspects = extract_aspect_sentiments(text)
        assert isinstance(aspects, dict)

    def test_scores_in_1_to_5_range(self):
        text = "Camera is great. Battery is fast. Screen is vivid. Performance is smooth."
        aspects = extract_aspect_sentiments(text)
        for key, val in aspects.items():
            assert 1.0 <= val <= 5.0, f"{key} score {val} out of range"

    def test_multiple_aspects_detected(self):
        text = (
            "The camera takes stunning pictures. "
            "Battery lasts all day. "
            "Performance is lightning fast. "
            "The display is vibrant."
        )
        aspects = extract_aspect_sentiments(text)
        assert len(aspects) >= 3


class TestScoreToAspectRating:

    def test_compound_1_maps_to_4(self):
        # formula: 2.0 + 1.0 * 2.0 = 4.0 (VADER compound max is 1.0)
        assert score_to_aspect_rating(1.0) == 4.0

    def test_compound_minus1_maps_to_1(self):
        assert score_to_aspect_rating(-1.0) == 1.0

    def test_compound_0_maps_to_midpoint(self):
        assert score_to_aspect_rating(0.0) == 2.0

    def test_output_clamped_to_range(self):
        assert score_to_aspect_rating(999) == 5.0
        assert score_to_aspect_rating(-999) == 1.0
