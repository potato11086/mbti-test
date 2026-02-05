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
        this.setupMobileOptimizations();
    }

    setupMobileOptimizations() {
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
            
            document.querySelectorAll('.option').forEach(option => {
                option.addEventListener('touchstart', function() {
                    this.classList.add('touch-active');
                }, { passive: true });
                
                option.addEventListener('touchend', function() {
                    this.classList.remove('touch-active');
                }, { passive: true });
            });
        }

        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    async loadData() {
        try {
            const questionsResponse = await fetch('questions.json');
            this.questions = await questionsResponse.json();
            
            const typesResponse = await fetch('mbti-types.json');
            this.mbtiTypes = await typesResponse.json();
        } catch (error) {
            console.error('Error loading data:', error);
            alert('加载数据失败，请刷新页面重试');
        }
    }

    bindEvents() {
        const startBtn = document.getElementById('start-btn');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const restartBtn = document.getElementById('restart-btn');
        const shareBtn = document.getElementById('share-btn');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startTest());
            startBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.startTest();
            }, { passive: false });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevQuestion());
            prevBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.prevQuestion();
            }, { passive: false });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
            nextBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.nextQuestion();
            }, { passive: false });
        }

        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartTest());
            restartBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.restartTest();
            }, { passive: false });
        }

        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareResult());
            shareBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.shareResult();
            }, { passive: false });
        }
    }

    updateTotalQuestions() {
        const totalQuestionsElement = document.getElementById('total-questions');
        if (totalQuestionsElement) {
            totalQuestionsElement.textContent = this.questions.questions.length;
        }
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
        this.scrollToTop();
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    displayQuestion() {
        const question = this.questions.questions[this.currentQuestionIndex];
        
        const currentQuestionElement = document.getElementById('current-question');
        const questionTextElement = document.getElementById('question-text');
        
        if (currentQuestionElement) {
            currentQuestionElement.textContent = this.currentQuestionIndex + 1;
        }
        
        if (questionTextElement) {
            questionTextElement.textContent = question.question;
        }
        
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
            
            if ('ontouchstart' in window) {
                optionElement.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.selectOption(question.id, option.value);
                }, { passive: false });
            }
            
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
        
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }

    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.questions.questions.length) * 100;
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentQuestionIndex === 0;
        }
        
        const currentQuestion = this.questions.questions[this.currentQuestionIndex];
        const hasAnswer = this.answers[currentQuestion.id] !== undefined;
        
        if (nextBtn) {
            if (this.currentQuestionIndex === this.questions.questions.length - 1) {
                nextBtn.textContent = '查看结果';
            } else {
                nextBtn.textContent = '下一题';
            }
            
            nextBtn.disabled = !hasAnswer;
        }
    }

    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
            this.scrollToTop();
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
            this.scrollToTop();
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
        this.scrollToTop();
        
        setTimeout(() => {
            this.showResult(mbtiType);
        }, 2000);
    }

    showResult(mbtiType) {
        const typeData = this.mbtiTypes.mbtiTypes[mbtiType];
        
        const mbtiTypeElement = document.getElementById('mbti-type');
        const mbtiNameElement = document.getElementById('mbti-name');
        
        if (mbtiTypeElement) {
            mbtiTypeElement.textContent = mbtiType;
        }
        
        if (mbtiNameElement) {
            mbtiNameElement.textContent = typeData.name;
        }
        
        const keywordsContainer = document.getElementById('keywords');
        keywordsContainer.innerHTML = '';
        typeData.keywords.forEach(keyword => {
            const keywordElement = document.createElement('span');
            keywordElement.className = 'keyword';
            keywordElement.textContent = keyword;
            keywordsContainer.appendChild(keywordElement);
        });
        
        const descriptionElement = document.getElementById('description');
        if (descriptionElement) {
            descriptionElement.textContent = typeData.description;
        }
        
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
        this.scrollToTop();
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
        this.scrollToTop();
    }

    shareResult() {
        const mbtiTypeElement = document.getElementById('mbti-type');
        const mbtiNameElement = document.getElementById('mbti-name');
        
        const mbtiType = mbtiTypeElement ? mbtiTypeElement.textContent : '';
        const mbtiName = mbtiNameElement ? mbtiNameElement.textContent : '';
        
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