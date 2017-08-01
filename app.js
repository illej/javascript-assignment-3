(function() {

	var app = angular.module('calculator', ['file-model']);

	app.controller("CalController", function($scope) {

		$scope.numbers = [];
		$scope.results = {};
		$scope.status = null;
		$scope.idleAlert = true;
		$scope.firstAlert = null;
		$scope.secondAlert = null;
		$scope.loadFromStorageAlert = null;
		$scope.emptyStorageAlert = null;

       
       	$scope.isFileChosen = function() {
       		if ($scope.fileX) {
       			return true;
       		}
       		else {
       			return false;
       		}
       	};

		$scope.alertStatus = function (status) {
		    // surely there's a better way to do this???
		    switch (status) {
		        case null:
		            $scope.idleAlert = true;
		            $scope.firstAlert = false;
		            $scope.secondAlert = false;
		            break;
		        case "First":
		            $scope.idleAlert = false;
		            $scope.firstAlert = true;
		            $scope.secondAlert = false;
		            $scope.loadFromStorageAlert = false;
		            $scope.emptyStorageAlert = false;
		            break;
		        case "Second":
		            $scope.idleAlert = false;
		            $scope.firstAlert = false;
		            $scope.secondAlert = true;
		            $scope.loadFromStorageAlert = false;
		            $scope.emptyStorageAlert = false;
		            break;
		        case "Finished":
		            $scope.idleAlert = true;
		            $scope.firstAlert = false;
		            $scope.secondAlert = false;
		            $scope.loadFromStorageAlert = false;
		            $scope.emptyStorageAlert = false;
		            break;
		        case "loadStorage":
		            $scope.idleAlert = false;
		            $scope.secondAlert = false;
		            $scope.loadFromStorageAlert = true;
		            $scope.emptyStorageAlert = false;
		            break;
		        case "emptyStorage":
		            $scope.loadFromStorageAlert = false;
		            $scope.emptyStorageAlert = true;
		            break;
		    }
		};

		$scope.isStorage = function() {
			if (localStorage.getItem("storedObject")) {
				return true;
			}
			else {
				return false;
			}
		};
       
		/*	calculation functions */
		$scope.calSum = function(numbers) {
			var sum = 0;
			for (var index = 0; index < numbers.length; index++) {
				sum += numbers[index];
			}
			return sum;
		};

		// pass in <x/y>Numbers array and results.sum<X/Y> from $scope.calculate() and return MEAN.
		$scope.calMean = function(numbers, sum) {
			return sum / numbers.length;
		};

		$scope.xMinusMean = function(numbers, mean) { 
			var array = [];
			for (i = 0; i < numbers.length; i++) {
			    array.push(numbers[i] - mean);
			}
			console.log(array);
			return array;
		};

		$scope.calStdDeviation = function(sum, numbers) {		
			var stdDev = 0;
			stdDev = Math.sqrt(sum / (numbers.length - 1));
			return stdDev;
		};
		
		/*	linear regression */
		// XY
		$scope.xTimesY = function(xNumbers, yNumbers) {
			var XiYi = [];
			for (i = 0; i < xNumbers.length; i++) {
				XiYi.push(xNumbers[i] * yNumbers[i]);
			}
			console.log(XiYi);
			return XiYi;
		};
				
		// xSquared
		$scope.calcSquareArray = function(numbers) {
			var xSquared = [];
			for (i = 0; i < numbers.length; i++) {
				xSquared.push(Math.pow(numbers[i], 2));
			}
			return xSquared;
		};
		
		// beta1 :: =(sumXY-n*meanX*meanY) / (sumXsquared-n*meanX*meanX)
		$scope.beta1 = function(numbers, sum, meanX, meanY, sumXsq) {
			var beta = 0;
			beta = (sum - numbers.length * meanX * meanY) / (sumXsq - numbers.length * meanX * meanX);
			return beta;
		};
		
		// beta0 :: =meanY-beta1*meanX
		$scope.beta0 = function(beta1, meanX, meanY) {
			var beta = 0;
			beta = (meanY - beta1 * meanX);
			return beta;
		};
		
		/*	correlation */
		// top
		$scope.top = function(numbers, sumXY, sumX, sumY) {
			var top;
			top = (numbers.length * sumXY - sumX * sumY);
			return top;
		};
		// bottom
		$scope.bottom = function(numbers, sumXSquared, sumYSquared, sumX, sumY) {
			var bottom;
			bottom = Math.sqrt((numbers.length * sumXSquared - (sumX * sumX)) * (numbers.length * sumYSquared - (sumY * sumY)));
			return bottom;
		};
		// top / bottom
		$scope.divide = function(x, y) {
			return x / y;
		};
		
		// rSquared
		$scope.calcSquare = function(num) {
			return Math.pow(num, 2);
		};

		//	USING INPUT FIELD
		$scope.calcYk = function() {
			var Xk = $scope.estimate;
			$scope.results.Yk = $scope.results.beta0 + $scope.results.beta1 * Xk;
		};
		/*	ASSUMING XK = 386
		$scope.calcYk = function(beta0, beta1, Xk) {
			return beta0 + beta1 * Xk;
		};*/
		
		/*	ONE */
		$scope.getData = function() {
			if ($scope.status == null) {
				$scope.readFile($scope.fileX);
				$scope.status = "First";
			}
			else if ($scope.status == "First") {
				$scope.readFile($scope.fileX);
				$scope.status = "Second";
			}
			else if ($scope.status == "Second") {
				$scope.status = "Finished";
			}
			$scope.alertStatus($scope.status);
		};
		
		/* TWO */
		$scope.readFile = function(file) {
			// new object of FileReader using input, and store in variable
			var reader = new FileReader(file);
			// read contents of variable as text
			reader.readAsText(file);
			// onload,
			reader.onload = function() {
				// store result of reading as text in new variable
                var textInFile = reader.result;
                // convert result to array of numbers
				var numbers = $scope.convertStringtoNumbers(textInFile);
                /* Sync */
                $scope.$applyAsync($scope.numbers.push(numbers));
				
				/* 	THREE :: once both files are chosen and button is pressed, we get to here, and define the 2 array elements
					as their separate data sets */
				if ($scope.numbers.length === 2) {
					$scope.calculate($scope.numbers[0], $scope.numbers[1]);				
				}
			};	
		};
		
		/*	FOUR :: begin to perform calculatoins on both data sets */
		$scope.calculate = function(xNumbers, yNumbers) {
			
			var results = {};
			results.numbers = [];
			
			results.numbers.push(xNumbers);
			results.numbers.push(yNumbers);
			
			results.sumX = $scope.calSum(xNumbers);
			results.sumY = $scope.calSum(yNumbers);

			results.meanX = $scope.calMean(xNumbers, results.sumX);
			results.meanY = $scope.calMean(yNumbers, results.sumY);
			
			results.xMinusMeanArray = $scope.xMinusMean(xNumbers, results.meanX);
			results.yMinusMeanArray = $scope.xMinusMean(yNumbers, results.meanY);
			
			results.xMinusMeanSquaredArray = $scope.calcSquareArray(results.xMinusMeanArray);
			results.yMinusMeanSquaredArray = $scope.calcSquareArray(results.yMinusMeanArray);
			
			results.SumXMinusMeanSquared = $scope.calSum(results.xMinusMeanSquaredArray);
			results.SumYMinusMeanSquared = $scope.calSum(results.yMinusMeanSquaredArray);
			
			results.stdDeviationX = $scope.calStdDeviation(results.SumXMinusMeanSquared, xNumbers);
			results.stdDeviationY = $scope.calStdDeviation(results.SumYMinusMeanSquared, yNumbers);
			
			/* 	PSP02 
				linear regression */
			results.xTimesY = $scope.xTimesY(xNumbers, yNumbers);
			
			results.sumXY = $scope.calSum(results.xTimesY);
			
			results.xSquared = $scope.calcSquareArray(xNumbers);
			
			results.sumXSquared = $scope.calSum(results.xSquared);
			
			results.beta1 = $scope.beta1(xNumbers, results.sumXY, results.meanX, results.meanY, results.sumXSquared);
	
			results.beta0 = $scope.beta0(results.beta1, results.meanX, results.meanY);

			/*	correlation */
			results.ySquared = $scope.calcSquareArray(yNumbers);
			
			results.sumYSquared = $scope.calSum(results.ySquared);
			
			results.top = $scope.top(xNumbers, results.sumXY, results.sumX, results.sumY);
			
			results.bottom = $scope.bottom(xNumbers, results.sumXSquared, results.sumYSquared, results.sumX, results.sumY);
			
			results.topDividedByBottom = $scope.divide(results.top, results.bottom);
			
			results.r = results.topDividedByBottom;
			
			results.rSquared = $scope.calcSquare(results.r);
			/*	ASSUMES Xk = 386. COMMENT OUT IF USING INPUT FIELD FOR Xk */
			//results.Xk = 386;
			results.Yk = $scope.calcYk(/*results.beta0, results.beta1, results.Xk*/);

			$scope.sendToStorage(results);
			$scope.results = results;
		};
		 
        $scope.convertStringtoNumbers = function(text) {
			return text.split("\n").map(Number);
        };

		/*	LOCAL STORAGE */
		$scope.sendToStorage = function(object) {
			// convert object containing data & results to a string
			var stringObject = JSON.stringify(object);
			// store string object in LocalStorage
			localStorage.setItem("storedObject", stringObject);
		};
		
		$scope.loadStorage = function() {
			// retrieve string object from LocalStorage and store in a variable
			var storedString = localStorage.getItem("storedObject");
			// parse string object to original form and store in a variable
			var convertedObject = JSON.parse(storedString);
			// return stored contents to original object to be displayed
			$scope.results = convertedObject;
			$scope.alertStatus("loadStorage");
		};

		$scope.clearStorage = function() {
		    localStorage.removeItem("storedObject");
		    $scope.alertStatus("emptyStorage");
		};
	});
})();