import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

try {
  ReactDOM.createRoot(document.getElementById('root')).render(<App />)
} catch(e) {
  document.getElementById('root').innerHTML = '<pre style="padding:30px;color:red;white-space:pre-wrap;background:#fff"><b>STARTUP ERROR:</b>\n' + (e?.stack || String(e)) + '</pre>';
}
