class MBTITest {
    constructor() {
        this.questions = [];
        this.mbtiTypes = {};
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.scores = {
            E: 0,
            I: 0,
            S: 0,
            N: 0,
            T: 0,
            F: 0,
            J: 0,
            P: 0
        };
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.bindEvents();
        this.updateTotalQuestions();
    }

    async loadData() {
        try {
            const questionsResponse = await fetch('questions.json');
            this.questions = await questionsResponse.json();
            
            const typesResponse = await fetch('mbti-types.json');
            this.mbtiTypes = await typesResponse.json();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    bindEvents() {
        document.getElementById('start-btn').addEventListener('click', () => this.startTest());
        document.getElementById('prev-btn').addEventListener('click', () => this.prevQuestion());
        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartTest());
        document.getElementById('share-btn').addEventListener('click', () => this.shareResult());
    }

    updateTotalQuestions() {
        document.getElementById('total-questions').textContent = this.questions.questions.length;
    }

    startTest() {
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.scores = {
            E: 0,
            I: 0,
            S: 0,
            N: 0,
            T: 0,
            F: 0,
            J: 0,
            P: 0
        };
        
        this.showScreen('quiz-screen');
        this.displayQuestion();
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    displayQuestion() {
        const question = this.questions.questions[this.currentQuestionIndex];
        
        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
        document.getElementById('question-text').textContent = question.question;
        
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.textContent = option.text;
            optionElement.dataset.value = option.value;
            optionElement.dataset.questionId = question.id;
            
            if (this.answers[question.id] === option.value) {
                optionElement.classList.add('selected');
            }
            
            optionElement.addEventListener('click', () => this.selectOption(question.id, option.value));
            optionsContainer.appendChild(optionElement);
        });
        
        this.updateProgress();
        this.updateNavigationButtons();
    }

    selectOption(questionId, value) {
        this.answers[questionId] = value;
        
        const options = document.querySelectorAll('.option');
        options.forEach(option => {
            if (option.dataset.questionId == questionId) {
                option.classList.remove('selected');
                if (option.dataset.value === value) {
                    option.classList.add('selected');
                }
            }
        });
        
        this.updateNavigationButtons();
    }

    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.questions.questions.length) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        prevBtn.disabled = this.currentQuestionIndex === 0;
        
        const currentQuestion = this.questions.questions[this.currentQuestionIndex];
        const hasAnswer = this.answers[currentQuestion.id] !== undefined;
        
        if (this.currentQuestionIndex === this.questions.questions.length - 1) {
            nextBtn.textContent = '查看结果';
        } else {
            nextBtn.textContent = '下一题';
        }
        
        nextBtn.disabled = !hasAnswer;
    }

    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
        } else {
            this.calculateResult();
        }
    }

    calculateResult() {
        this.scores = {
            E: 0,
            I: 0,
            S: 0,
            N: 0,
            T: 0,
            F: 0,
            J: 0,
            P: 0
        };
        
        this.questions.questions.forEach(question => {
            const answer = this.answers[question.id];
            if (answer) {
                this.scores[answer]++;
            }
        });
        
        const mbtiType = this.getMBTIType();
        this.showLoadingScreen(mbtiType);
    }

    getMBTIType() {
        const eOrI = this.scores.E >= this.scores.I ? 'E' : 'I';
        const sOrN = this.scores.S >= this.scores.N ? 'S' : 'N';
        const tOrF = this.scores.T >= this.scores.F ? 'T' : 'F';
        const jOrP = this.scores.J >= this.scores.P ? 'J' : 'P';
        
        return eOrI + sOrN + tOrF + jOrP;
    }

    showLoadingScreen(mbtiType) {
        this.showScreen('loading-screen');
        
        setTimeout(() => {
            this.showResult(mbtiType);
        }, 2000);
    }

    showResult(mbtiType) {
        const typeData = this.mbtiTypes.mbtiTypes[mbtiType];
        
        document.getElementById('mbti-type').textContent = mbtiType;
        document.getElementById('mbti-name').textContent = typeData.name;
        
        const keywordsContainer = document.getElementById('keywords');
        keywordsContainer.innerHTML = '';
        typeData.keywords.forEach(keyword => {
            const keywordElement = document.createElement('span');
            keywordElement.className = 'keyword';
            keywordElement.textContent = keyword;
            keywordsContainer.appendChild(keywordElement);
        });
        
        document.getElementById('description').textContent = typeData.description;
        
        const strengthsContainer = document.getElementById('strengths');
        strengthsContainer.innerHTML = '';
        typeData.strengths.forEach(strength => {
            const li = document.createElement('li');
            li.textContent = strength;
            strengthsContainer.appendChild(li);
        });
        
        const weaknessesContainer = document.getElementById('weaknesses');
        weaknessesContainer.innerHTML = '';
        typeData.weaknesses.forEach(weakness => {
            const li = document.createElement('li');
            li.textContent = weakness;
            weaknessesContainer.appendChild(li);
        });
        
        const careerContainer = document.getElementById('career');
        careerContainer.innerHTML = '';
        typeData.career.forEach(career => {
            const careerElement = document.createElement('span');
            careerElement.className = 'career-item';
            careerElement.textContent = career;
            careerContainer.appendChild(careerElement);
        });
        
        this.displayDimensionsChart();
        
        this.showScreen('result-screen');
    }

    displayDimensionsChart() {
        const dimensionsChart = document.getElementById('dimensions-chart');
        dimensionsChart.innerHTML = '';
        
        const dimensions = [
            { left: 'E', right: 'I', leftScore: this.scores.E, rightScore: this.scores.I },
            { left: 'S', right: 'N', leftScore: this.scores.S, rightScore: this.scores.N },
            { left: 'T', right: 'F', leftScore: this.scores.T, rightScore: this.scores.F },
            { left: 'J', right: 'P', leftScore: this.scores.J, rightScore: this.scores.P }
        ];
        
        dimensions.forEach(dimension => {
            const total = dimension.leftScore + dimension.rightScore;
            const leftPercentage = total > 0 ? (dimension.leftScore / total) * 100 : 50;
            const rightPercentage = total > 0 ? (dimension.rightScore / total) * 100 : 50;
            
            const dimensionBar = document.createElement('div');
            dimensionBar.className = 'dimension-bar';
            
            const labels = document.createElement('div');
            labels.className = 'dimension-labels';
            labels.innerHTML = `${dimension.left}<br>${dimension.right}`;
            
            const barContainer = document.createElement('div');
            barContainer.className = 'bar-container';
            
            const barFill = document.createElement('div');
            barFill.className = 'bar-fill';
            barFill.style.width = `${leftPercentage}%`;
            
            const label = document.createElement('div');
            label.className = 'bar-label';
            label.textContent = `${dimension.leftScore} : ${dimension.rightScore}`;
            
            barContainer.appendChild(barFill);
            barContainer.appendChild(label);
            
            dimensionBar.appendChild(labels);
            dimensionBar.appendChild(barContainer);
            
            dimensionsChart.appendChild(dimensionBar);
        });
    }

    restartTest() {
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.scores = {
            E: 0,
            I: 0,
            S: 0,
            N: 0,
            T: 0,
            F: 0,
            J: 0,
            P: 0
        };
        
        this.showScreen('welcome-screen');
    }

    shareResult() {
        const mbtiType = document.getElementById('mbti-type').textContent;
        const mbtiName = document.getElementById('mbti-name').textContent;
        
        const shareText = `我完成了 MBTI 性格测试，我的性格类型是 ${mbtiType} - ${mbtiName}！快来测测你的性格类型吧！`;
        
        if (navigator.share) {
            navigator.share({
                title: 'MBTI 性格测试结果',
                text: shareText,
                url: window.location.href
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                alert('结果已复制到剪贴板！');
            }).catch(() => {
                alert(shareText);
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MBTITest();
});