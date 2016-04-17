/**
 *
 * PRIORRITY QUEUE (based on arrays for simplicity reasons)
 *
 */

/**
 * @constructor
 */
function PriorityQueue() {
	this.queue = [];
};

PriorityQueue.prototype.length = function() {
	return this.queue.length;
};

var sortPrio = function(e1, e2) {
	if (e1.getKey() < e2.getKey())
		return -1;
	else if (e1.getKey() == e2.getKey())
		return 0;
	else
		return 1;
};

PriorityQueue.prototype.insert = function(elem) {
	this.queue.push(elem);
	this.queue.sort(sortPrio);
};

PriorityQueue.prototype.extractMin = function() {
	var minEl = this.queue.shift();
	this.queue.sort(sortPrio);
	return minEl;
};

PriorityQueue.prototype.top = function() {
	return this.queue[0];
};

PriorityQueue.prototype.remove = function(elem) {
	var index = this.queue.indexOf(elem);
	this.queue[index] = null;
	this.queue.sort(sortPrio);
};

PriorityQueue.prototype.decreaseKey = function(gnode, newKey) {
	var elem = this.find(gnode);
	if (elem === null) {
		console.log(gnode + " is not contained in the priority queue.");
		return;
	};
	elem.setKey(newKey);
	this.queue.sort(sortPrio);
};

PriorityQueue.prototype.isEmpty = function() {
	return this.queue.length == 0;
};

PriorityQueue.prototype.contains = function(gnode) {
	return (this.find(gnode) !== null);
};

PriorityQueue.prototype.getKey = function(gnode) {
	var elem = this.find(gnode);
	if (elem === null) {
		console.log(gnode + " is not contained in the priority queue.");
		return;
	};
	return elem.getKey();
};

PriorityQueue.prototype.find = function(value) {
	for (var i = 0; i < this.queue.length; i++) {
		if (this.queue[i].getValue() == value) {
			return this.queue[i];
		};
	};
	return null;
};

PriorityQueue.prototype.getElements = function() {
	var result = [];
	for (var i = 0; i < this.queue.length; i++) {
		result.push(this.queue[i].getValue());
	};
	return result;
};

/**
 * cloning function to fix deep copying of arrays
 */
PriorityQueue.prototype.clone = function() {
	var newObj = new PriorityQueue();
	for (var i = 0; i < this.queue.length; i++) {
		newObj.queue[i] = jQuery.extend(true, {}, this.queue[i]);
	};
	return newObj;
};

/**
 *
 * NODE
 *
 */

/**
 * @constructor
 * @param {Number} key Schlüssel bzw. Priorität des Elements
 * @param {Object} value Inhalt des Elements
 */
Node = function(key, value) {
	this.key = key;
	this.value = value;
};

Node.prototype.setKey = function(newKey) {
	this.key = newKey;
};

Node.prototype.getKey = function() {
	return this.key;
};

Node.prototype.getValue = function() {
	return this.value;
};
