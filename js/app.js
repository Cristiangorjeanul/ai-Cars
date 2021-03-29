$(function () {


	var vehicleNumber = 1;
	var numVehicles = 0;
	var maxVehicles = 10;
	var lanePref = 2;
	var vehicles = [];

	function Vehicle(type, lane) {
		this.type = type ? 2 : 1;
		this.name = type ? "taxi" : "bus";
		this.lane = type ? lane : 2;
		this.lanePref = Math.floor(Math.random() * lanePref);
		this.lanePref = 2;
		this.width = type ? 50 : 100;
		this.location = - this.width;
		this.speed = (5 + Math.floor(Math.random() * 8) + (5 * type)) / 2;
		this.caution = this.speed * 1.5;
		this.isMatching = false;
		this.matched = {};
		this.id = vehicleNumber;

		numVehicles += 1;
		vehicleNumber += 1;
		addToLane(lane, this);
	}

	Vehicle.prototype.drive = function () {
		var carAhead = carAheadInCurrentLane(this);
		var speed = this.speed;
		if (carAhead) {
			if (canSwitchLanes(this)) {
				switchLane(this);
			} else {
				speed = matchSpeed(this, carAhead);
			}
		} else {
			$("#" + this.id).text(this.id);
			this.isMatching = false;
			this.matched = {};

			if (this.lane != this.lanePref && this.lanePref != 2) {
				if (canSwitchLanes(this)) {
					switchLane(this);
				}
			}
		}

		this.location += speed ? speed : this.speed;
		$("#" + this.id).css("left", this.location + "px"); // move it

		if (this.location > $(window).width()) {
			remove(this);
			numVehicles -= 1;
		}
	}

	function getMatched(car) {
		if (car.isMatching) {
			return getMatched(car.matched);
		} else {
			return car;
		}
	}

	function matchSpeed(car, carAhead) {
		var carToMatch = getMatched(carAhead);

		car.matched = carToMatch;
		car.isMatching = true;
		return carToMatch.speed;
	}


	function canSwitchLanes(object) {
		var canSwitch = true;
		var oBack = object.location;
		var oFront = object.location + object.width;

		for (let item of vehicles) {
			if (object.id != item.id && item.lane != object.lane) {
				var iBack = item.location;
				var iFront = item.location + item.width;

				if (iBack > oBack - object.caution && iBack < oFront + object.caution) {
					canSwitch = false;
				}
				if (iFront > oBack - object.caution && iFront < oFront + object.caution) {
					canSwitch = false;
				}
				if (oBack - object.caution > iBack && oBack - object.caution < iFront) {
					canSwitch = false;
				}
				if (oFront + object.caution > iBack && oFront + object.caution < iFront) {
					canSwitch = false;
				}
			}
		}

		return canSwitch;
	}

	function carAheadInCurrentLane(object) {
		var carAhead = 0;
		vehicles.forEach(function (item, index) {
			if (object.id != item.id && item.lane == object.lane) {
				if ((object.location + object.width + object.caution) > (item.location) && (object.location + object.width) < item.location) {
					carAhead = item;
				}
			}
		})

		return carAhead;
	}

	function showCurrentVehiclesInLanes() {
		$("#street1").text("Cars number-Lane 2: " + "");
		$("#street1").css("text-align", "center");
		$("#street1").css("color", "magenta");
		$("#street1").css("font-size", "21px");
		$("#street2").text("Cars number-Lane 1: " + "");
		$("#street2").css("text-align", "center");
		$("#street2").css("color", "lime");
		$("#street2").css("font-size", "21px");
		vehicles.forEach(function (item) {
			if (item.lane == 0) {
				$("#street1").append(item.id + ", ");
			} else {
				$("#street2").append(item.id + ", ");
			}
		})
	}

	function switchLane(object) {
		oneChangeLane = true;
		vehicles.forEach(function (item) {
			if (item.id == object.id) {
				item.lane = item.lane ? 0 : 1;
			}
		});

		object.isMatching = false;
		object.matched = {};

		$("#" + object.id).toggleClass("lane1 lane0");

		showCurrentVehiclesInLanes();
	}

	function addToLane(lane, object) {
		object.lane = lane;
		vehicles.push(object);

		$("#road")
			.append('<div id="' + object.id + '" class="' + object.name + " lane" + object.lane + '"></div>');

		showCurrentVehiclesInLanes();
	}

	function remove(object) {
		$("#" + object.id).remove();
		vehicles = jQuery.grep(vehicles, function (value) {
			return value.id != object.id;
		});
		unlinkVehicles(object);
		showCurrentVehiclesInLanes();
	}

	function unlinkVehicles(object) {
		vehicles.forEach(function (item, index) {
			if (item.matched == object) {
				item.matched = {};
				item.isMatching = false;
			}
		})
	}

	function laneOpen(lane) {
		var laneOpen = true;
		vehicles.forEach(function (item, index) {
			if (item.lane == lane && item.location < item.caution) {
				laneOpen = false;
			}
		});
		return laneOpen;
	}

	function createVehicle() {
		if (numVehicles < maxVehicles) {
			var lane = Math.floor(Math.random() * 2);
			var type = Math.floor(Math.random() * 8);
			if (laneOpen(lane)) {
				var vehicle = new Vehicle(type, lane);
				setInterval(function () { vehicle.drive(); }, 200);
			}
		}
		var delay = 500 + Math.floor(Math.random() * 2000);
		setTimeout(function () { createVehicle(); }, delay);
	}

	function start() {
		createVehicle();
	}

	window.addEventListener('load', function () {
		start();
	});

});