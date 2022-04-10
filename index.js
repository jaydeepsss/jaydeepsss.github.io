(() => {

	// Credit: Mateusz Rybczonec

	const FULL_DASH_ARRAY = 283;
	let WARNING_THRESHOLD = 4;
	let ALERT_THRESHOLD = 2;

	const COLOR_CODES = {
		info: {
			color: "green"
		},
		warning: {
			color: "orange",
			threshold: WARNING_THRESHOLD
		},
		alert: {
			color: "red",
			threshold: ALERT_THRESHOLD
		}
	};

	const TIME_LIMIT = 6;
	let timePassed = 0;
	let timeLeft = TIME_LIMIT;
	let timerInterval = null;
	let remainingPathColor = COLOR_CODES.info.color;

	document.getElementById("app").innerHTML = `
		<div class="base-timer">
		<svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
			<g class="base-timer__circle">
			<circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
			<path
				id="base-timer-path-remaining"
				stroke-dasharray="283"
				class="base-timer__path-remaining ${remainingPathColor}"
				d="
				M 50, 50
				m -45, 0
				a 45,45 0 1,0 90,0
				a 45,45 0 1,0 -90,0
				"
			></path>
			</g>
		</svg>
		<span id="base-timer-label" class="base-timer__label">${formatTime(
				timeLeft
			)}</span>
		</div>
		`;

	startTimer();

	function onTimesUp() {
		clearInterval(timerInterval);
	}

	function startTimer() {
		timerInterval = setInterval(() => {
			timePassed = timePassed += 1;
			timeLeft = TIME_LIMIT - timePassed;
			document.getElementById("base-timer-label").innerHTML = formatTime(
				timeLeft
			);
			setCircleDasharray();
			setRemainingPathColor(timeLeft);

			if (timeLeft === 0) {
				onTimesUp();
				document.querySelector('#resetModal .modal-body').innerText = 'TimeOut..! Your Score: ' + getScore();
				$('#resetModal').modal('show');
				resetGame()
			}
		}, 1000);
	}

	function resetTimer() {
		ALERT_THRESHOLD = 2;
		WARNING_THRESHOLD = 4;
		timePassed = -1;
		onTimesUp();
		startTimer();
	}


	function formatTime(time) {
		const minutes = Math.floor(time / 60);
		let seconds = time % 60;

		if (seconds < 10) {
			seconds = `0${seconds}`;
		}

		return `${minutes}:${seconds}`;
	}

	function setRemainingPathColor(timeLeft) {
		const { alert, warning, info } = COLOR_CODES;
		if (timeLeft <= alert.threshold) {
			document
				.getElementById("base-timer-path-remaining")
				.classList.remove(warning.color);
			document
				.getElementById("base-timer-path-remaining")
				.classList.add(alert.color);
		} else if (timeLeft <= warning.threshold) {
			document
				.getElementById("base-timer-path-remaining")
				.classList.remove(info.color);
			document
				.getElementById("base-timer-path-remaining")
				.classList.add(warning.color);
		}
	}

	function calculateTimeFraction() {
		const rawTimeFraction = timeLeft / TIME_LIMIT;
		return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
	}

	function setCircleDasharray() {
		const circleDasharray = `${(
			calculateTimeFraction() * FULL_DASH_ARRAY
		).toFixed(0)} 283`;
		document
			.getElementById("base-timer-path-remaining")
			.setAttribute("stroke-dasharray", circleDasharray);
	}

	let option1 = document.querySelector('#option1'),
		option2 = document.querySelector('#option2'),
		option3 = document.querySelector('#option3');

	setHighScore();

	function generateNumber(max) {
		return Math.floor(Math.random() * max);
	}

	function generateOperator() {
		var randomPercentage = Math.random();
		if (randomPercentage < 0.25) {
			return `+`;
		} else if (randomPercentage < 0.50) {
			return `-`;
		} else {
			return `*`;
		}
	}

	function getScore() {
		return parseInt(document.querySelector('#span_score').innerHTML);
	}

	let btnStart = document.querySelector('#btn_start'),
		btnReset = document.querySelector('#btn_reset');
	btn_start.addEventListener('click', e => {
		displayQuestion();

	});

	btn_reset.addEventListener('click', e => {
		resetGame();
	});

	function displayQuestion() {
		defaultBtn();
		resetTimer();
		document.querySelector('#questions').classList.remove('d-none');

		// document.querySelector('#spinnerwraper').classList.remove('d-none');

		let score = getScore() === 0 ? 1 : getScore(),
			page = Math.ceil(score / 5),
			max = page + 5;

		let countOfNumber = 3,
			countOfOperator = countOfNumber - 1,
			label = '', answer;

		for (var i = 0; i < countOfNumber; i++) {
			label = label + generateNumber(max);
			if (i < countOfNumber - 1) {
				label = label + generateOperator()
			}
		}
		answer = eval(label);
		document.querySelector('#lbl_question').innerHTML = label;
		setAnswerKeys(answer);
	}

	option1.addEventListener('click', e => {
		checkAnswer(option1, option1.correct);
	});

	option2.addEventListener('click', e => {
		checkAnswer(option2, option2.correct);
	});

	option3.addEventListener('click', e => {
		checkAnswer(option3, option3.correct);
	});

	function checkAnswer(btn, correct) {
		if (correct) {
			document.querySelector('#span_score').innerHTML = getScore() + 1;
			btn.classList.add('correct');
			setTimeout(() => {
				displayQuestion();
			}, 500);
		} else {
			btn.classList.add('incorrect');
			document.querySelector('#resetModal .modal-body').innerText = 'Game Over..! Your Score: ' + getScore();
			$('#resetModal').modal('show');
			setTimeout(() => {
				resetGame();
			}, 500);
		}
	}

	function resetGame() {
		setHighScore();
		onTimesUp();
		// alert('Your Score: ' + getScore());
		document.querySelector('#questions').classList.add('d-none');
		document.querySelector('#span_score').innerHTML = 0;
		defaultBtn();
	}

	function setHighScore() {
		let highscore = localStorage.highscore ? localStorage.highscore : 0;
		if (getScore() > highscore) {
			localStorage.highscore = getScore();
			document.querySelector('#highscore').innerHTML = getScore();
		} else if (getScore() === 0) {
			if (highscore > 0) document.querySelector('#highscore').innerHTML = highscore;
		}
	}

	function defaultBtn() {
		option1.classList.remove('correct');
		option1.classList.remove('incorrect');
		option2.classList.remove('correct');
		option2.classList.remove('incorrect');
		option3.classList.remove('correct');
		option3.classList.remove('incorrect');
	}

	function setAnswerKeys(answer) {
		let answerAt = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
		let fakeAns1 = generateNumber(answer),
			fakeAns2 = generateNumber(answer);

		if (fakeAns1 === answer) {
			fakeAns1 = fakeAns1 + 2;
		}

		if (fakeAns2 === answer) {
			fakeAns2 = fakeAns2 + 4;
		}

		if (fakeAns2 === fakeAns1) {
			fakeAns1 = fakeAns1 + 8;
			fakeAns2 = fakeAns2 + 4;
		}

		if (answerAt === 1) {
			option1.innerHTML = answer;
			option1.correct = true;
			option2.innerHTML = fakeAns1;
			option2.correct = false;
			option3.innerHTML = fakeAns2;
			option3.correct = false;
		} else if (answerAt === 2) {
			option2.innerHTML = answer;
			option2.correct = true;
			option1.innerHTML = fakeAns1;
			option1.correct = false;
			option3.innerHTML = fakeAns2;
			option3.correct = false;
		} else if (answerAt === 3) {
			option3.innerHTML = answer;
			option3.correct = true;
			option2.innerHTML = fakeAns1;
			option2.correct = false;
			option1.innerHTML = fakeAns2;
			option1.correct = false;
		}


	}

	
})();