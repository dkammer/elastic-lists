$(function () {
    view = new ElasticList({
        el: $("#main"),
        data: dataCount,
        onchange: function (filters) {
            const resultsContainer = document.getElementById('results-row');
            resultsContainer.innerHTML = '';

            if (Object.keys(filters).length === 0) {
                return;
            }

            const filtered = dataCount.filter(item =>
                Object.entries(filters).every(([key, value]) =>
                  String(item[key] || '').toLowerCase() === String(value).toLowerCase()
                )
              );

            filtered.forEach(item => {
                const domElement = createDomElementAlt(item);
                resultsContainer.appendChild(domElement);
            });
        },
        hasFilter: true,
        countColumn: "total",
        align: 'horizontal',
        columns: [
            {
                title: "Presentacion",
                attr: "csv_presentacion",
                formatter: function (value, option) {
                    if (value == "UNI") {
                        return "Uni formater value";
                    }
                    console.info(option);
                    return value;
                }
            }, {
                title: "Marca",
                attr: "csv_marca"
            }, {
                title: "Modalidad",
                attr: "csv_modalidad"
            }]
    });
});
