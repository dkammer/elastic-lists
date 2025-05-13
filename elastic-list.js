/**
 * A simple javascript library to build elastic lists. Elastic lists allow to navigate large,
 * multi-dimensional info spaces with just a few clicks, never letting you run into situations
 * with zero results.
 * Repository home page: https://github.com/mbaez/elastic-lists
 * @author: Maximiliano Báez<maxibaezpy@gmail.com>
 */


/**
 * This class is responsible to build the elastic list view
 */
var ElasticBuilder = function () {
    /**
     * Data graph
     * @field
     */
    this.grafo = {};

    /**
     * Map of preproced values count
     * @field
     */
    this.countMap = {}

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
}

/**
 * Constructor of class.
 * @param {Object} options Description
 * @config {Jquery.El} el container of the view.
 * @config {Object} data the use to  build de view.
 * @config {function} [onchange]
 * @config {boolean} [hasFilter]
 * @config {String} [countColumn]
 * @config {String} [panelTemplate]
 * @config {String} [panelHeadTemplate]
 * @config {String} [panelBodyTemplate]
 * @config {Object} columns
 * @config {Object} [defaultValue]
 * @config {String} [aling]
 * @config {function} [beforeSearch]
 */
ElasticBuilder.prototype.initialize = function (options) {
    for (var attr in options) {
        this[attr] = options[attr];
    }
    this.buildContainer();
    this.buildList();
    this.bindEvents();
    this.setSelected();
}

/**
 * This function will be called before the search. This event is triggered when the column input
 * text is change (key typed)
 * @param {String} value the search criteria typed
 * @param {String} columnAttr the attribute name of the column
 * @return {String} a new serch criteria.
 */
ElasticBuilder.prototype.beforeSearch = function (value, columnAttr) {
    return value;
}

/**
 * Build a encode string.
 *
 * @param {Sting} value the input string
 * @returns {String} The encode string for the input.
 */
ElasticBuilder.prototype.genId = function (value) {
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
 * Build a compose string in the follow format : "encode frist string" + "X" + "enconde second
 * string"
 * @param {Sting} first the prefix of the enconde string.
 * @param {Sting} second the sufix of the enconde string.
 * @returns {String} a encode string .
 */
ElasticBuilder.prototype.getKey = function (first, second) {
    return this.genId(this.parseValue(first)) + "X" + this.genId(this.parseValue(second));
}

/**
 * Build a compose string.
 * @returns {String} a encode string .
 */
ElasticBuilder.prototype.genColumnId = function (attr) {
    return attr + "X" + this.genId(attr);
}

/**
 *
 * @param {type} value Description
 * @returns {type} Description
 */
ElasticBuilder.prototype.parseValue = function (value) {
    return value == null || typeof value == "undefined" || value.length == 0 ? "Unknown" : value;
}

/**
 * Check if the selected filters is in the current node.
 */
ElasticBuilder.prototype.isIn = function (node, filters) {
    var resp = true;
    for (var key in filters) {
        if (this.genId(this.parseValue(node[key])) != this.genId(this.parseValue(filters[key]))) {
            resp = false;
        }
    }
    return resp;
}

/**
 * Returns the active filters of each column.
 */
ElasticBuilder.prototype.getFilters = function () {
    var $filters = this.el.find(".active");
    var filters = {};
    $filters.each(function () {
        var key = $(this).parent().attr("data-name");
        var value = $(this).find(":not(.badge)").parent().attr("data-value");
        filters[key] = value;
    });
    return filters;
}

/**
 * This method is responsible for applying the filters to the elastic list data.
 */
ElasticBuilder.prototype.applyFilters = function ($target, undo) {
    var map = {};
    var attrKey = null,
        nodes;
    var filters = this.getFilters();
    for (var key in filters) {
        attrKey = this.getKey(key, filters[key]);
    }
    // if no active filter exists
    if (attrKey == null) {
        this.el.find("li").removeClass(this.hideClass);
        for (var elId in this.countMap) {
            this.el.find("#" + elId).text(this.countMap[elId]);
        }
        if (typeof this.onchange != "undefined") {
            this.onchange({});
        }
        return;
    }
    nodes = this.grafo[attrKey];
    attrKey = attrKey.split("X");
    var targetId = $target.find('.badge').attr("id");
    var attr = attrKey[0],
        key = attrKey[1];
    //hide all elements
    this.el.find("li:not(.active)").addClass(this.hideClass);
    for (var i = 0; i < nodes.length; i++) {
        if (this.isIn(nodes[i], filters)) {
            for (var j = 0; j < this.columns.length; j++) {
                var nodeKey = this.columns[j].attr;
                var elId = this.getKey(nodeKey, nodes[i][nodeKey]);
                var $el = $("#" + elId).parent();
                var count = this.count(map, elId, nodes[i]);
                if (nodeKey != attr) {
                    $el.removeClass(this.hideClass);
                }
                $("#" + elId).text(count);
            }
        }
    }
    if (typeof this.onchange != "undefined" && (typeof this.settingDefault == "undefined" || !this.settingDefault)) {
        this.onchange(filters);
    }

    this.settingDefault = false;
}

/**
 * This method handles the on-click event triggered from one of the rows of the elastic list.
 */
ElasticBuilder.prototype.clickHandler = function (el) {
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
 * If the defaultValue attribute is defined, it will be pre-selected in the list.
 */
ElasticBuilder.prototype.setSelected = function (options) {
    var args = typeof options == "undefined" ? this.defaultValue : options;

    if (typeof args == "undefined") {
        return;
    }
    for (var attr in args) {
        var value = args[attr];
        value = this.parseValue(value);
        var key = value.toString().toLowerCase();
        var elKey = this.getKey(attr, key);
        var $target = $("#" + elKey);
        if ($target.length > 0) {
            this.settingDefault = true;
            $target.parent().click();
        }
    }
};

/**
 * Main method responsible for processing the data and building the containers that
 * define the elastic list.
 * @function
 * @private
 */
ElasticBuilder.prototype.buildContainer = function () {
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
        $ul.attr("id", this.genColumnId(attr));
        $ul.attr("data-name", attr);
        $ulPanel.append($ulhead);
        //if the filter is allowed
        if (typeof this.hasFilter != "undefined" && this.hasFilter) {
            var $ulFilter = $input.clone();
            $ulFilter.attr("placeholder", this.columns[j].title);
            $ulPanel.append($ulFilter);
            var $style = $("<style></style>");
            $style.attr("class", this.genColumnId(attr));
            $ulPanel.append($style);
        }
        $ulPanel.append($ul);
        $ulContainer.append($ulPanel);
        this.el.append($ulContainer);
    }
}

/**
 * This method is responsible for obtaining the total data associated with the column.
 * This number can be obtained from the countColumn if specified.
 */
ElasticBuilder.prototype.count = function (countMap, key, node) {
    var hasCountColumn = typeof this.countColumn == "undefined" ? false : true;
    if (typeof countMap[key] == "undefined") {
        countMap[key] = hasCountColumn ? node[this.countColumn] : 1;
        return countMap[key];
    }
    countMap[key] += hasCountColumn ? node[this.countColumn] : 1;
    return countMap[key];
}

/**
 * Main method responsible for processing the data and building the columns that
 * define the elastic list.
 * @function
 * @private
 */
ElasticBuilder.prototype.buildList = function () {
    // Clear previous list entries
    for (var j = 0; j < this.columns.length; j++) {
        var attr = this.columns[j].attr;
        this.el.find("#" + this.genColumnId(attr)).empty();
    }

    var tempLists = {};
    var badgeMap = {}; // Track badges by elKey

    var maxCount = 0;
    for (var i = 0; i < this.data.length; i++) {
        for (var j = 0; j < this.columns.length; j++) {
            var attr = this.columns[j].attr;
            var value = this.data[i][attr];
            value = this.parseValue(value);
            var key = value.toString().toLowerCase();
            var elKey = this.getKey(attr, key);
            var counter = this.count(this.countMap, elKey, this.data[i]);
            if (counter > maxCount) maxCount = counter;
        }
    }

    for (var i = 0; i < this.data.length; i++) {
        for (var j = 0; j < this.columns.length; j++) {
            var attr = this.columns[j].attr;
            var value = this.data[i][attr];
            value = this.parseValue(value);
            var key = value.toString().toLowerCase();
            var elKey = this.getKey(attr, key);

            // Always update the count
            var count = this.countMap[elKey];

            if (typeof this.grafo[elKey] === "undefined") {
                this.grafo[elKey] = [];
            }

            if (!badgeMap[elKey]) {
                // First time seeing this key: build element
                var $li = $("<li class='list-group-item'></li>");
                var $span = $("<div></div>");
                var $badge = $("<div></div>");

                $badge.addClass('badge');
                $badge.attr("id", elKey);
                $badge.text(count);

                badgeMap[elKey] = $badge;

                $li.attr("data-value", key);

                if (typeof this.columns[j].formatter == "function") {
                    value = this.columns[j].formatter(value, this.data[i]);
                }

                var tmpValue = this.beforeSearch(value.toString().toLowerCase());
                $li.attr("data-formatted", tmpValue);

                $span.text(value);
                $span.addClass("elastic-data");

                // Scale height based on count
                var minHeight = 26;
                var maxHeight = 80;
                var height = minHeight + (maxHeight - minHeight) * (count / maxCount); // linear
                // var height = minHeight + (maxHeight - minHeight) * (Math.log(count + 1) / Math.log(maxCount + 1)); // logarithmic
                $li.css("height", height + "px");

                $li.append($badge);
                $li.append($span);

                if (!tempLists[attr]) tempLists[attr] = [];
                tempLists[attr].push($li);
            } else {
                // Update badge count
                badgeMap[elKey].text(count);
            }

            this.grafo[elKey].push(this.data[i]);
        }
    }

    // Sort and append
    for (var j = 0; j < this.columns.length; j++) {
        var attr = this.columns[j].attr;
        var $ul = this.el.find("#" + this.genColumnId(attr));

        if (tempLists[attr]) {
            tempLists[attr].sort(function (a, b) {
                var aVal = a.attr("data-formatted");
                var bVal = b.attr("data-formatted");
                return aVal.localeCompare(bVal);
            });

            tempLists[attr].forEach(function ($li) {
                $ul.append($li);
            });
        }
    }
};

/**
 * Responsible for applying a specific filter.
 * @function
 * @private
 */
ElasticBuilder.prototype.bindEvents = function () {
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
 * Responsible for hiding the rows that do not match the search criteria from
 * the column filter input. CSS is used to hide/show elements because it is more efficient
 * than using jQuery's hide and show methods.
 * @function
 * @private
 * @param {Event} event reference to the jQuery event object triggered by the keyup in the input
 * of each column.
 */
ElasticBuilder.prototype.findData = function (event) {
    event.stopPropagation();
    var $input = $(event.target);
    var $column = $input.parent().find("ul");
    var columnAttr = $column.attr("data-name");
    var columnId = $column.attr("id");
    // Dependiente del input que es tipeado, setea los valores.
    var data = $input.val().trim();
    var $style = this.el.find("." + columnId);
    if (data.length > 0) {
        //preprocesar data para el find
        data = data.toLocaleLowerCase();
        data = this.beforeSearch(data, columnAttr);
        var rule = " ul#" + columnId + ' li[data-formatted*="' + data + '"]{display:block;} ';
        rule += " ul#" + columnId + ' li:not([data-formatted*="' + data + '"]){display:none;}';
        $style.html(rule);
    } else {
        $style.html("");
    }
    return;
}

/**
 * This method is responsible for clearing the filter criteria set by the filter input.
 * It also clears the CSS rules established by the filtering.
 */
ElasticBuilder.prototype.cleanFilters = function () {
    this.el.find("style").each(function () {
        $(this).html("");
    });
}

/**
 * This class is responsible to build the elastic list view and expose all public methods
 * Constructor of class.
 * @param {Object} options Description
 * @config {Jquery.El} el container of the view.
 * @config {Object} data the use to  build de view.
 * @config {function} [onchange]
 * @config {boolean} [hasFilter]
 * @config {String} [countColumn]
 * @config {String} [panelTemplate]
 * @config {String} [panelHeadTemplate]
 * @config {String} [panelBodyTemplate]
 * @config {Object} columns
 * @config {Object} [defaultValue]
 * @config {String} [aling]
 * @config {function} [beforeSearch]
 */
var ElasticList = function (options) {
    this.builder = new ElasticBuilder(options);
    this.builder.initialize(options);
}

/**
 * Returns the active filters of each column.
 */
ElasticList.prototype.getFilters = function () {
    return this.builder.getFilters();
}

/**
 * If the defaultValue attribute is defined, it will be pre-selected in the
 * list.
 * @param {Options} options list of selections.
 */
ElasticList.prototype.setSelected = function (options) {
    return this.builder.setSelected(options);
}

/**
 * Clean all selections of the view.
 */
ElasticList.prototype.clean = function (options) {
    var slecteds = this.getFilters();
    this.builder.setSelected(slecteds);
    this.builder.settingDefault = false;

}
