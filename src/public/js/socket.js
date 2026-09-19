const socket = io();

socket.on('servicesUpdated', (services) => {
  const container = document.getElementById('availability-list');

  if (!container) {
    return;
  }

  container.innerHTML = services
    .map(
      (service) => `
        <article class="service-card">
          <h2>${service.name}</h2>
          <p>${service.description}</p>
          <p>Duración: ${service.duration} minutos</p>
          <p>Precio: $${service.price}</p>
          <p>Categoría: ${service.category}</p>
        </article>
      `
    )
    .join('');
});
