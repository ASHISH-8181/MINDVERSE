import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Loading from '../../components/Loading/Loading';
import { FiPlay, FiClock, FiAward, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

// Static quiz data from Summarizer
const STATIC_QUIZZES = [
  {
    _id: "1",
    title: "Computer Networks",
    description: "Test your knowledge on Computer Networks and Internet protocols",
    duration: 10,
    questions: [
      {
        id: "q1",
        question: "Which historic network project is mentioned as the origin of the Internet in the notes?",
        options: ["ARPANET", "CSNET", "BITNET", "ARPANET-II"],
        correctAnswer: 0,
        explanation: "The notes explicitly mention ARPANET as the early research network that led to the Internet."
      },
      {
        id: "q2",
        question: "Which two reference models/protocol stacks are described in the document?",
        options: ["OSI and TCP/IP", "HTTP and FTP", "SMTP and IMAP", "Ethernet and Wi-Fi"],
        correctAnswer: 0,
        explanation: "The notes present both the OSI model and the TCP/IP model, describing the function of each layer."
      },
      {
        id: "q3",
        question: "What addressing and routing topics are covered in the notes?",
        options: ["IP addressing, subnetting, IPv4 packet format", "MAC addressing only", "DNS internals", "BGP configuration examples"],
        correctAnswer: 0,
        explanation: "The summary mentions IP addressing (Classes A–E), subnetting basics, and the IPv4 packet format."
      },
      {
        id: "q4",
        question: "Which switching techniques are explained with examples in the document?",
        options: ["Packet switching and circuit switching", "Circuit switching only", "Virtual switching only", "Store-and-forward switching"],
        correctAnswer: 0,
        explanation: "The notes explain packet switching, circuit switching, datagram networks, and virtual circuits."
      },
      {
        id: "q5",
        question: "Which security topics does the final section discuss?",
        options: ["Firewalls (types), NAT, and security policies", "SSL/TLS handshake internals", "Encryption algorithms only", "Physical security of hardware"],
        correctAnswer: 0,
        explanation: "The final section covers firewalls (packet filter, application gateway, circuit-level gateway), NAT, and security policies."
      }
    ]
  },
  {
    _id: "2",
    title: "Money Spending Problem",
    description: "Solve the classic money spending puzzle with fractions and calculations",
    duration: 5,
    questions: [
      {
        id: "q1",
        question: "How many spending stages does the lady go through?",
        options: ["One", "Two", "Three", "Four"],
        correctAnswer: 2,
        explanation: "The lady goes through three spending stages: buying handkerchiefs, second spending, and buying a book."
      },
      {
        id: "q2",
        question: "What does the lady buy in the first spending stage?",
        options: ["A book", "Handkerchiefs", "Clothes", "Food"],
        correctAnswer: 1,
        explanation: "In the first spending stage, she spends half of her total money on buying handkerchiefs."
      },
      {
        id: "q3",
        question: "How much money is left with the lady after all three spending stages?",
        options: ["2 rupees", "1 rupee", "0.5 rupees", "3 rupees"],
        correctAnswer: 1,
        explanation: "After all three 'spend half' steps, the lady is left with exactly 1 rupee when she reaches home."
      },
      {
        id: "q4",
        question: "What is the pattern of spending in each stage?",
        options: ["Spend all money", "Spend half of remaining money", "Spend one-third", "Spend a fixed amount"],
        correctAnswer: 1,
        explanation: "In each stage, she spends half of whatever money she has at that point."
      }
    ]
  }
];

export default function Quiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Load static quizzes
    setLoading(true);
    setTimeout(() => {
      setQuizzes(STATIC_QUIZZES);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && currentQuiz) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentQuiz && !score) {
      handleSubmitQuiz();
    }
  }, [timeLeft, currentQuiz, score]);

  const startQuiz = (quizId) => {
    const quiz = STATIC_QUIZZES.find(q => q._id === quizId);
    if (quiz) {
      setCurrentQuiz(quiz);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setAnswers([]);
      setTimeLeft(quiz.duration * 60);
      setScore(null);
      setShowResults(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (selectedAnswer === null) {
      toast.error('Please select an answer');
      return;
    }
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      handleSubmitQuiz(newAnswers);
    }
  };

  const handleSubmitQuiz = (finalAnswers = null) => {
    const answersToSubmit = finalAnswers || answers;
    
    // Calculate score
    let correctCount = 0;
    answersToSubmit.forEach((answer, index) => {
      if (currentQuiz.questions[index].correctAnswer === answer) {
        correctCount++;
      }
    });
    
    const accuracy = Math.round((correctCount / currentQuiz.questions.length) * 100);
    
    setScore({
      score: correctCount,
      total: currentQuiz.questions.length,
      accuracy: accuracy,
      answers: answersToSubmit
    });
    setShowResults(true);
    toast.success('Quiz submitted successfully!');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <Loading />;

  if (score && showResults) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center mb-6">
            <FiAward className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Quiz Complete!</h2>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Your Score</p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {score.score}/{score.total}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Accuracy</p>
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                  {score.accuracy}%
                </p>
              </div>
            </div>
          </div>

          {/* Show detailed results */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Review Your Answers</h3>
            <div className="space-y-4">
              {currentQuiz.questions.map((question, index) => {
                const userAnswerIndex = score.answers[index];
                const isCorrect = question.correctAnswer === userAnswerIndex;
                
                return (
                  <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-2">
                      {isCorrect ? (
                        <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                      ) : (
                        <FiXCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white mb-2">
                          Q{index + 1}: {question.question}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span className={isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            Your answer: {question.options[userAnswerIndex]}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                            Correct answer: {question.options[question.correctAnswer]}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setScore(null);
                setCurrentQuiz(null);
                setShowResults(false);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Take Another Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentQuiz) {
    const question = currentQuiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / currentQuiz.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentQuiz.title}</h2>
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <FiClock />
                {formatTime(timeLeft)}
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Question {currentQuestion + 1} of {currentQuiz.questions.length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {question.question}
            </h3>
            <div className="space-y-3">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    selectedAnswer === idx
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <span className="font-semibold text-gray-900 dark:text-white">{option}</span>
                </button>
              ))}
            </div>
            <button
              onClick={handleNext}
              className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              {currentQuestion < currentQuiz.questions.length - 1 ? 'Next' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-5 lg:py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Quiz</h1>
          <Link
            to="/leaderboard"
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
          >
            <FiAward /> Leaderboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{quiz.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{quiz.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <FiClock /> {quiz.duration} min
                </span>
                <span>{quiz.questions.length} questions</span>
              </div>
              <button
                onClick={() => startQuiz(quiz._id)}
                disabled={quizLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <FiPlay /> Start Quiz
              </button>
            </div>
          ))}
          {quizzes.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No quizzes available yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

