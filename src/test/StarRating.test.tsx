import { render, screen } from '@testing-library/react'
import StarRating from '../components/StarRating'

describe('StarRating', () => {

  it('renders 5 star elements', () => {
    render(<StarRating rating={4} />)
    // Each star is an <svg> element
    const stars = document.querySelectorAll('svg')
    expect(stars).toHaveLength(5)
  })

  it('fills correct number of stars for a whole number rating', () => {
    const { container } = render(<StarRating rating={3} />)
    const stars = container.querySelectorAll('svg')

    // Stars 1–3 should be amber (filled), stars 4–5 should be gray (empty)
    const filledStars = Array.from(stars).filter(s =>
      s.classList.contains('text-amber-400')
    )
    const emptyStars = Array.from(stars).filter(s =>
      s.classList.contains('text-gray-200')
    )

    expect(filledStars).toHaveLength(3)
    expect(emptyStars).toHaveLength(2)
  })

  it('treats a half-star rating as amber (filled or half)', () => {
    const { container } = render(<StarRating rating={4.5} />)
    const stars = container.querySelectorAll('svg')

    // Stars 1–4 filled, star 5 is half → all 5 should be amber-400
    const amberStars = Array.from(stars).filter(s =>
      s.classList.contains('text-amber-400')
    )
    expect(amberStars).toHaveLength(5)
  })

  it('renders all empty stars for rating 0', () => {
    const { container } = render(<StarRating rating={0} />)
    const grayStars = container.querySelectorAll('svg.text-gray-200')
    expect(grayStars).toHaveLength(5)
  })

  it('applies xs size class', () => {
    const { container } = render(<StarRating rating={4} size="xs" />)
    const firstStar = container.querySelector('svg')
    expect(firstStar).toHaveClass('w-3', 'h-3')
  })

  it('applies lg size class', () => {
    const { container } = render(<StarRating rating={4} size="lg" />)
    const firstStar = container.querySelector('svg')
    expect(firstStar).toHaveClass('w-5', 'h-5')
  })

})
