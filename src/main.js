import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'

document.querySelector('#app').innerHTML = `
  <div class="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
    <div class="relative py-3 sm:max-w-xl sm:mx-auto">
      <div class="absolute inset-0 bg-gradient-to-r from-cyan-400 to-sky-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
      <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
        <div class="flex items-center justify-center space-x-4">
          <a href="https://vite.dev" target="_blank" class="transition-transform hover:scale-110">
            <img src="${viteLogo}" class="h-16" alt="Vite logo" />
          </a>
          <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" class="transition-transform hover:scale-110">
            <img src="${javascriptLogo}" class="h-16" alt="JavaScript logo" />
          </a>
        </div>
        <div class="mt-8 text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">Stamos Project</h1>
          <div class="mt-6">
            <button id="counter" type="button" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"></button>
          </div>
          <p class="mt-6 text-gray-500 text-sm">
            Click on the Vite logo to learn more
          </p>
        </div>
      </div>
    </div>
  </div>
`

setupCounter(document.querySelector('#counter'))
