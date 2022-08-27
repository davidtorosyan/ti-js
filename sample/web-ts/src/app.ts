import * as ti from 'ti-js/dist/web/ti'

ti.exec('Disp "hello world"', output => {
  document.body.innerHTML += output
})
