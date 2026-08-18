import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>diir
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1><br>
          </br>
          
          <h2>
             Chào bạn khoá 24CT đến với học phần CNPM-DAU 
          </h2>
        </div>
      
      </section>

 

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App

