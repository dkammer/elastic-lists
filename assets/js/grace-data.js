$(function () {
    view = new ElasticList({
        el: $("#main"),
        data: dataElastic,
        hasFilter: true,
        onchange: function (filters) {
            const resultsContainer = document.getElementById('results-row');
            resultsContainer.innerHTML = '';

            if (Object.keys(filters).length === 0) {
                return;
            }

            const filtered = dataElastic.filter(item =>
                Object.entries(filters).every(([key, value]) =>
                  String(item[key] || '').toLowerCase() === String(value).toLowerCase()
                )
              );

            filtered.forEach(item => {
                const domElement = createEventGrace(item);
                resultsContainer.appendChild(domElement);
            });
        },
        align: 'horizontal',
        columns: [
            {
                title: "Place",
                attr: "related_to_place_label"
            }, {
                title: "Person",
                attr: "person_object_label"
            }, {
                title: "Type",
                attr: "type_object_label"
            }, {
                title: "Credit",
                attr: "credited_label"
            }, {
                title: "Year",
                attr: 'start_year'
            }
        ]       
    });
});