import { render, screen } from '@testing-library/react'
import HeroSection from '../components/HeroSection'
import { heroProduct } from '../data/mockData'

describe('HeroSection', () => {

  it('renders the main headline', () => {
    render(<HeroSection />)
    expect(screen.getByText(/Find the best products/i)).toBeInTheDocument()
  })

  it('renders the overall rating value', () => {
    render(<HeroSection />)
    // 4.6 appears twice (overall rating + battery aspect) so use getAllByText
    const instances = screen.getAllByText(String(heroProduct.rating))
    expect(instances.length).toBeGreaterThanOrEqual(1)
  })

  it('renders review count', () => {
    render(<HeroSection />)
    expect(screen.getByText(/12,342 reviews/i)).toBeInTheDocument()
  })

  it('renders all 4 aspect labels', () => {
    render(<HeroSection />)
    expect(screen.getByText('Camera')).toBeInTheDocument()
    expect(screen.getByText('Battery')).toBeInTheDocument()
    expect(screen.getByText('Performance')).toBeInTheDocument()
    expect(screen.getByText('Display')).toBeInTheDocument()
  })

  it('renders all 4 aspect score values', () => {
    render(<HeroSection />)
    // camera=4.7, performance=4.5, display=4.4 are unique — use getByText
    // battery=4.6 matches the overall rating too — use getAllByText
    expect(screen.getByText(String(heroProduct.aspects.camera))).toBeInTheDocument()
    expect(screen.getAllByText(String(heroProduct.aspects.battery)).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(String(heroProduct.aspects.performance))).toBeInTheDocument()
    expect(screen.getByText(String(heroProduct.aspects.display))).toBeInTheDocument()
  })

})
