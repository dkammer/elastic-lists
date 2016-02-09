/**
 * A simple javascript library to build elastic lists. Elastic lists allow to navigate large, multi-dimensional info 
 * spaces with just a few clicks, never letting you run into situations with zero results.
 * @param {Object} options Description
 * @config {Jquery.El} el container of the view.
 * @config {Object} data the use to  build de view.
 * @config {function} onchange
 * @config {boolean} hasFilter
 * @config {String} countColumn
 * @config {String} panelTemplate
 * @config {String} panelHeadTemplate
 * @config {String} panelBodyTemplate
 * @config {Object} columns
 * @config {Object} defaultValue
 * @config {Object} [aling]
 */
function ElasticList(options) {
	var grafo = {};
	var countMap = {}

	/**
	 * template of the container of the elastic list.
	 * @field
	 */
	this.panelTemplate = '<div class="panel panel-default "></div>';
	/**
	 * template of the header of each column of the elastic list.
	 * @field
	 */
	this.panelHeadTemplate = '<div class="panel-heading"></div>';
	/**
	 * template of the container of the elastic list
	 * @field
	 */
	this.panelBodyTemplate = '<div class="panel-body"/></div>';
	/**
	 * the name of the css class which it's appended to all element hidden in the list
	 * @field
	 */
	this.hideClass = "hide-element";

	/**
	 * Build a encode string.
	 *
	 * @param {Sting} value the input string
	 * @returns {String} The encode string for the input.
	 */
	function genId(value) {
		value = value.toString();
		value = value.trim().toLowerCase();
		var hash = 0,
			i, chr, len;
		if (value.length == 0) return hash;
		for (i = 0, len = value.length; i < len; i++) {
			chr = value.charCodeAt(i);
			hash = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	}

	/**
	 * Build a compose string in the follow format : "encode frist string" + "X" + "enconde second string"
	 * @param {Sting} first the prefix of the enconde string.
	 * @param {Sting} second the sufix of the enconde string.
	 * @returns {String} a encode string .
	 */
	function getKey(first, second) {
		return genId(parseValue(first)) + "X" + genId(parseValue(second));
	}

	/**
	 * Build a compose string.
	 * @returns {String} a encode string .
	 */
	function genColumnId(attr) {
		return attr + "X" + genId(attr);
	}

	/**
	 *
	 * @param {type} value Description
	 * @returns {type} Description
	 */
	function parseValue(value) {
		return value == null || typeof value == "undefined" || value.length == 0 ? "Desconocido" : value;
	}

	/**
	 * Check if the selected filters is in the current node.
	 */
	function isIn(node, filters) {
		var resp = true;
		for (var key in filters) {
			if (genId(parseValue(node[key])) != genId(parseValue(filters[key]))) {
				resp = false;
			}
		}
		return resp;
	}

	/**
	 * Retorna los filtros activos de cada columna.
	 */
	function getFilters() {
		var $filters = options.el.find(".active");
		var filters = {};
		$filters.each(function () {
			var key = $(this).parent().attr("data-name");
			var value = $(this).find(":not(.badge)").parent().attr("data-value");
			filters[key] = value;
		});
		return filters;
	}

	/**
	 * Este método se encarga de aplicar los filtros a los datos del elastic list.
	 */
	this.applyFilters = function ($target, undo) {
		var map = {};
		var attrKey = null,
			nodes;
		var filters = getFilters();
		for (var key in filters) {
			attrKey = getKey(key, filters[key]);
		}
		//si no existe ningún filtro activo
		if (attrKey == null) {
			this.el.find("li").removeClass(this.hideClass);
			for (var elId in countMap) {
				this.el.find("#" + elId).text(countMap[elId]);
			}
			if (typeof options.onchange != "undefined") {
				options.onchange({});
			}
			return;
		}
		nodes = grafo[attrKey];
		attrKey = attrKey.split("X");
		var targetId = $target.find('.badge').attr("id");
		var attr = attrKey[0],
			key = attrKey[1];
		//hide all elements
		options.el.find("li:not(.active)").addClass(this.hideClass);
		for (var i = 0; i < nodes.length; i++) {
			if (isIn(nodes[i], filters)) {
				for (var j = 0; j < options.columns.length; j++) {
					var nodeKey = options.columns[j].attr;
					var elId = getKey(nodeKey, nodes[i][nodeKey]);
					var $el = $("#" + elId).parent();
					var count = this.count(map, elId, nodes[i]);
					if (nodeKey != attr) {
						$el.removeClass(this.hideClass);
					}
					$("#" + elId).text(count);
				}
			}
		}
		if (typeof options.onchange != "undefined" && (typeof this.settingDefault == "undefined" || !this.settingDefault)) {
			options.onchange(filters);
		}

		this.settingDefault = false;
	}

	/**
	 * Se encarga de manejar el evento on-click disparado desde una de las filas del elastic list.
	 */
	this.clickHandler = function (el) {
		var thiz = this;
		var $target = $(el);
		var undo = false;
		var clazz = $target.attr("class");
		if (clazz.indexOf(this.hideClass) >= 0) {
			return;
		} else if (clazz.indexOf("active") >= 0) {
			$target.removeClass("active");
			undo = true;
		} else {
			$target.addClass("active");
			$target.removeClass(this.hideClass);
		}

		if (typeof this.hasFilter !== "undefined" && this.hasFilter) {
			this.el.find("input").each(function () {
				$(this).val("");
				thiz.cleanFilters();
			});
		}
		this.applyFilters($target, undo);
	}

	/**
	 * Si el atributo defaultValue se encuentra definido, este se pre-selecciona en la
	 * lista.
	 */
	this.setSelected = function () {
		if (typeof this.defaultValue == "undefined") {
			return;
		}

		for (var attr in this.defaultValue) {
			var value = this.defaultValue[attr];
			value = parseValue(value);
			var key = value.toString().toLowerCase();
			var elKey = getKey(attr, key);
			var $target = $("#" + elKey);
			if ($target.length > 0) {
				this.settingDefault = true;
				$target.parent().click();

			}
		}
	};

	/**
	 * Método principal que se encarga de procesar los datos y constuir los contenedores que 
	 * definen la lista elástica.
	 * @function
	 * @private
	 */
	this.buildContainer = function () {
		//var len = parseInt(12 / this.columns.length);
		var len = this.align === 'vertical' ? 12 : parseInt(12 / this.columns.length);
		var $container = $("<div class='list-container'></div>");
		var $input = $("<input type='text' class='elastic-filter'>");
		var $panel = $(this.panelTemplate);
		$container.addClass("col-md-" + len + "");
		var $head = $(this.panelHeadTemplate);
		var $body = $(this.panelBodyTemplate);
		for (var j = 0; j < this.columns.length; j++) {
			var attr = this.columns[j].attr;
			var $ulContainer = $container.clone();
			var $ulPanel = $panel.clone();
			var $ulhead = $head.clone();
			//var $ulBody = $body.clone();
			$ulhead.text(this.columns[j].title);
			var $ul = $("<ul class='list-group'></ul>");
			$ul.attr("id", genColumnId(attr));
			$ul.attr("data-name", attr);
			$ulPanel.append($ulhead);
			//if the filter is allowed
			if (typeof this.hasFilter != "undefined" && this.hasFilter) {
				var $ulFilter = $input.clone();
				$ulFilter.attr("placeholder", this.columns[j].title);
				$ulPanel.append($ulFilter);
				var $style = $("<style></style>");
				$style.attr("class", genColumnId(attr));
				$ulPanel.append($style);
			}
			$ulPanel.append($ul);
			$ulContainer.append($ulPanel);
			this.el.append($ulContainer);
		}
	}

	/**
	 * Se encarga de obtener el total de datos aosociados a la columna. 
	 * Este número se pude obtener de la columna countColumn si se encuentra especificada.
	 */
	this.count = function (countMap, key, node) {
		var hasCountColumn = typeof this.countColumn == "undefined" ? false : true;
		if (typeof countMap[key] == "undefined") {
			countMap[key] = hasCountColumn ? node[this.countColumn] : 1;
			return countMap[key];
		}
		countMap[key] += hasCountColumn ? node[this.countColumn] : 1;
		return countMap[key];
	}

	/**
	 * Método principal que se encarga de procesar los datos y constuir las columnas que 
	 * definen la lista elástica.
	 * @function
	 * @private
	 */
	this.buildList = function () {
		var count = 0;
		for (var i = 0; i < this.data.length; i++) {
			for (var j = 0; j < this.columns.length; j++) {
				var attr = this.columns[j].attr;
				var value = this.data[i][attr];
				value = parseValue(value);
				var key = value.toString().toLowerCase();
				var elKey = getKey(attr, key);
				if (typeof countMap[elKey] == "undefined") {
					count = this.count(countMap, elKey, this.data[i]);
					grafo[elKey] = [];
					var $ul = this.el.find("#" + genColumnId(attr));
					var $li = $("<li class='list-group-item'></li>");
					var $span = $("<div></div>");
					var $badge = $span.clone();
					$badge.addClass('badge');
					$badge.attr("id", elKey);
					$badge.text(count);
					// adding the true value of the element
					$li.attr("data-value", value.toString().toLowerCase());
					// if the current column has a custom formatter
					if (typeof this.columns[j].formatter == "function") {
						value = this.columns[j].formatter(value);
					}
					// adding the formatted value of the string
					$li.attr("data-formatted", value.toString().toLowerCase());
					$span.text(value);
					$span.addClass("elastic-data");
					$li.append($badge);
					$li.append($span);
					$ul.append($li);
				} else {
					count = this.count(countMap, elKey, this.data[i]);
					this.el.find("#" + elKey).text(count);
				}
				grafo[elKey].push(this.data[i]);
			}
		}
	}

	/**
	 * Se encarga de asociar los eventos a los componentes del elastic list
	 * @function
	 * @private
	 */
	this.bindEvents = function () {
		var thiz = this;
		this.el.find("li").on("click", function (e) {
			thiz.clickHandler(this);
		});

		if (typeof this.hasFilter !== "undefined" && this.hasFilter) {
			this.el.find("input.elastic-filter").on("keyup", function (e) {
				thiz.findData(e);
			});
		}
	}

	/**
	 * Se encarga de ocultar las filas que no coinciden con el criterio de busqueda del 
	 * input de filtrado de las columnas. Se utiliza CSS para ocultar/mostrar los elementos
	 * debido a que es más eficiente que hide y show de jquery.
	 * @function
	 * @private
	 * @param {Event} event referencia al objeto evento de jquery iniciado por el keyup en el input
	 * de cada columna.
	 */
	this.findData = function (event) {
		event.stopPropagation();
		var $input = $(event.target);
		var $column = $input.parent().find("ul");
		var columnId = $column.attr("id");
		// Dependiente del input que es tipeado, setea los valores.
		var data = $input.val().trim();
		var $style = this.el.find("." + columnId);
		if (data.length > 0) {
			data = data.toLocaleLowerCase();
			var rule = " ul#" + columnId + ' li[data-formatted*="' + data + '"]{display:block;} ';
			rule += " ul#" + columnId + ' li:not([data-formatted*="' + data + '"]){display:none;}';
			$style.html(rule);
		} else {
			$style.html("");
		}
		return;
	}

	/**
	 * Este método se encarga de limpliar los criterios del filtrados establecidos por el input de filtrado.
	 * Se encarga de limpiar las reglas css establecidas en el filtrado.
	 */
	this.cleanFilters = function () {
		this.el.find("style").each(function () {
			$(this).html("");
		});
	}


	/**
	 * Constructor of class.
	 * @param {Object} options Description
	 * @config {Jquery.El} el container of the view.
	 * @config {Object} data the use to  build de view.
	 * @config {function} onchange
	 * @config {boolean} hasFilter
	 * @config {String} countColumn
	 * @config {String} panelTemplate
	 * @config {String} panelHeadTemplate
	 * @config {String} panelBodyTemplate
	 * @config {Object} columns
	 * @config {Object} defaultValue
	 * @config {Object} [aling]
	 */
	this.initialize = function (options) {
		for (var attr in options) {
			this[attr] = options[attr];
		}
		this.buildContainer();
		this.buildList();
		this.bindEvents();
		this.setSelected();
	}

	this.initialize(options);

	return {
		getFilters: getFilters
	}
}
