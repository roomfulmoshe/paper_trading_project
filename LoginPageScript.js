const labels = document.querySelectorAll('.form-control label')

labels.forEach(label => {
  label.innerHTML = label.innerText
    .split('')
    .map((letter, idx) => `<span style="transition-delay:${idx * 50}ms">${letter}</span>`)
    .join('')
})


// Wait for the page to load
window.addEventListener('load', () => {
  const container = document.querySelector('.container');

  container.classList.add('animate-container');
});



// Get the container element where the animation will be displayed
const container = document.querySelector(".lottie-container");

// Load the Lottie animation from the provided URL
lottie.loadAnimation({
  container: container, // Specify the container element
  renderer: "svg", // Choose the renderer (svg, canvas, html)
  loop: true, // Set animation loop
  autoplay: true, //  play automatically
  path: "https://lottie.host/8a070d3f-c828-474c-9ed6-082616f7fe78/prCCI1Nlzb.json", // Provide the URL of the animation JSON
});
