import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HeroSection from '../components/HeroSection'
import { heroProduct } from '../data/mockData'

const renderComp = () => render(<MemoryRouter><HeroSection /></MemoryRouter>)

describe('HeroSection', () => {

  it('renders the main headline', () => {
    renderComp()
    expect(screen.getByText(/Find the best products/i)).toBeInTheDocument()
  })

  it('renders the overall rating value', () => {
    renderComp()
    const instances = screen.getAllByText(String(heroProduct.rating))
    expect(instances.length).toBeGreaterThanOrEqual(1)
  })

  it('renders review count', () => {
    renderComp()
    expect(screen.getByText(/12,342 reviews/i)).toBeInTheDocument()
  })

  it('renders all 4 aspect labels', () => {
    renderComp()
    expect(screen.getByText('Camera')).toBeInTheDocument()
    expect(screen.getByText('Battery')).toBeInTheDocument()
    expect(screen.getByText('Performance')).toBeInTheDocument()
    expect(screen.getByText('Display')).toBeInTheDocument()
  })

  it('renders all 4 aspect score values', () => {
    renderComp()
    expect(screen.getByText(String(heroProduct.aspects.camera))).toBeInTheDocument()
    expect(screen.getAllByText(String(heroProduct.aspects.battery)).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(String(heroProduct.aspects.performance))).toBeInTheDocument()
    expect(screen.getByText(String(heroProduct.aspects.display))).toBeInTheDocument()
  })

})
