function createDomElement(data) {
    // Create a container div for each item (Bootstrap's col-md-4 for grid layout)
    const container = document.createElement('div');
    container.classList.add('col-md-4', 'mb-4');  // Bootstrap grid classes for responsive layout
  
    // Create a card element for the item
    const card = document.createElement('div');
    card.classList.add('card', 'h-100');  // Add Bootstrap card class
  
    // Create a card-body div
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
  
    // Create the title (e.g., name or full name)
    const title = document.createElement('h5');
    title.classList.add('card-title');
    title.textContent = `${data.firstname} ${data.surname}`;
  
    // Create the category
    const category = document.createElement('p');
    category.classList.add('card-text');
    category.textContent = `Category: ${data.category}`;
  
    // Create the city and country
    const location = document.createElement('p');
    location.classList.add('card-text');
    location.textContent = `City: ${data.city}, Country: ${data.country}`;
  
    // Append elements to the card body
    cardBody.appendChild(title);
    cardBody.appendChild(category);
    cardBody.appendChild(location);
  
    // Append the card body to the card container
    card.appendChild(cardBody);
  
    // Append the card to the col container
    container.appendChild(card);
  
    return container;
  }

  function createDomElementAlt(data) {
    // Create column container
    const container = document.createElement('div');
    container.classList.add('col-md-4', 'mb-4');
  
    // Card wrapper
    const card = document.createElement('div');
    card.classList.add('card', 'h-100');
  
    // Card body
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
  
    // Title (e.g., Marca)
    const title = document.createElement('h5');
    title.classList.add('card-title');
    title.textContent = `Brand: ${data.csv_marca}`;
  
    // Details
    const presentacion = document.createElement('p');
    presentacion.classList.add('card-text');
    presentacion.textContent = `Presentation: ${data.csv_presentacion}`;
  
    const modalidad = document.createElement('p');
    modalidad.classList.add('card-text');
    modalidad.textContent = `Modality: ${data.csv_modalidad}`;
  
    const total = document.createElement('p');
    total.classList.add('card-text');
    total.textContent = `Total: ${data.total}`;
  
    // Assemble card
    cardBody.appendChild(title);
    cardBody.appendChild(presentacion);
    cardBody.appendChild(modalidad);
    cardBody.appendChild(total);
    card.appendChild(cardBody);
    container.appendChild(card);
  
    return container;
  }
  

  function createEventGrace(data) {
    // Create column container
    const container = document.createElement('div');
    container.classList.add('col-md-4', 'mb-4');
  
    // Card wrapper
    const card = document.createElement('div');
    card.classList.add('card', 'h-100');
  
    // Card body
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
  
    // Title with link
    const title = document.createElement('h5');
    title.classList.add('card-title');
    const titleLink = document.createElement('a');
    titleLink.href = data.EVENT_1;
    titleLink.textContent = data.EVENT_1_label || 'View Event';
    titleLink.classList.add('text-decoration-none');
    title.appendChild(titleLink);
  
    // Person
    const person = document.createElement('p');
    person.classList.add('card-text');
    person.textContent = `Person: ${data.person_object_label || 'Unknown'}`;
  
    // Place
    const place = document.createElement('p');
    place.classList.add('card-text');
    place.textContent = `Place: ${data.related_to_place_label || 'N/A'}`;
  
    // Date
    const date = document.createElement('p');
    date.classList.add('card-text');
    date.textContent = `Date: ${data.date_label || 'Unknown'}`;
  
    // Credited
    const credit = document.createElement('p');
    credit.classList.add('card-text');
    if (data.credited && data.credited_label) {
      const creditLink = document.createElement('a');
      creditLink.href = data.credited;
      creditLink.textContent = data.credited_label;
      creditLink.classList.add('text-decoration-none');
      credit.appendChild(document.createTextNode('Credited: '));
      credit.appendChild(creditLink);
    }
  
    // Assemble card
    cardBody.appendChild(title);
    cardBody.appendChild(person);
    cardBody.appendChild(place);
    cardBody.appendChild(date);
    if (credit.textContent) cardBody.appendChild(credit);
    card.appendChild(cardBody);
    container.appendChild(card);
  
    return container;
  }
  