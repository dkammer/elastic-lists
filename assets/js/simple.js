$(function () {
    view = new ElasticList({
        el: $("#main"),
        data: dataElastic,
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
                const domElement = createDomElement(item);
                resultsContainer.appendChild(domElement);
            });
        },
        columns: [
            {
                title: "Country",
                attr: "country"
            }, {
                title: "Gender",
                attr: "gender"
            }, {
                title: "Year",
                attr: "year"
            }, {
                title: "Category",
                attr: "category"
            }, {
                title: "City",
                attr: 'city'
            }, {
                title: "University",
                attr: "name"
            }
        ]
    });
});