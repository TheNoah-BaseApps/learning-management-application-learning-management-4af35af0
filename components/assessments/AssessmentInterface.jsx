'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AssessmentInterface({ assessmentId, onComplete }) {
  const [assessment, setAssessment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (assessmentId) {
      fetchAssessment();
    }
  }, [assessmentId]);

  useEffect(() => {
    if (assessment && timeRemaining !== null && timeRemaining > 0 && !submitted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [assessment, timeRemaining, submitted]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/assessments/${assessmentId}`);
      if (!response.ok) throw new Error('Failed to fetch assessment');
      
      const data = await response.json();
      setAssessment(data.data);
      
      if (data.data.duration) {
        setTimeRemaining(data.data.duration * 60);
      }
    } catch (err) {
      console.error('Error fetching assessment:', err);
      setError(err.message || 'Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    if (!assessment || !assessment.questions) return 0;

    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    assessment.questions.forEach(question => {
      totalPoints += question.points || 1;
      const userAnswer = answers[question.id];

      if (question.type === 'multiple_choice') {
        if (parseInt(userAnswer) === question.correct_answer) {
          correctAnswers++;
          earnedPoints += question.points || 1;
        }
      } else if (question.type === 'true_false') {
        if (userAnswer === question.correct_answer) {
          correctAnswers++;
          earnedPoints += question.points || 1;
        }
      }
    });

    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    
    return {
      correctAnswers,
      totalQuestions: assessment.questions.length,
      earnedPoints,
      totalPoints,
      percentage: Math.round(percentage)
    };
  };

  const handleSubmit = async (autoSubmit = false) => {
    const score = calculateScore();
    const passed = score.percentage >= (assessment.passing_score || 70);

    setResult({
      ...score,
      passed,
      autoSubmit
    });
    setSubmitted(true);

    try {
      const response = await fetch(`/api/assessments/${assessmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          score: score.percentage,
          passed
        })
      });

      if (!response.ok) throw new Error('Failed to submit assessment');

      if (onComplete) {
        onComplete(score);
      }
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setError('Failed to submit assessment. Your answers have been recorded locally.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goToQuestion = (index) => {
    if (index >= 0 && index < assessment.questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!assessment) {
    return (
      <Alert>
        <AlertDescription>Assessment not found</AlertDescription>
      </Alert>
    );
  }

  if (submitted && result) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {result.passed ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {result.passed ? 'Congratulations!' : 'Assessment Complete'}
          </CardTitle>
          <CardDescription>
            {result.autoSubmit 
              ? 'Time expired - Your assessment has been automatically submitted'
              : 'Your assessment has been submitted successfully'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div>
              <div className="text-4xl font-bold mb-2">{result.percentage}%</div>
              <Badge variant={result.passed ? 'default' : 'destructive'} className="text-lg px-4 py-1">
                {result.passed ? 'Passed' : 'Failed'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center pt-4 border-t">
              <div>
                <div className="text-2xl font-semibold">{result.correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Correct Answers</div>
              </div>
              <div>
                <div className="text-2xl font-semibold">{result.totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Total Questions</div>
              </div>
              <div>
                <div className="text-2xl font-semibold">{result.earnedPoints}</div>
                <div className="text-sm text-muted-foreground">Points Earned</div>
              </div>
              <div>
                <div className="text-2xl font-semibold">{result.totalPoints}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </div>
            </div>
          </div>

          {!result.passed && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Passing score required: {assessment.passing_score || 70}%. 
                You may retake this assessment to improve your score.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => window.location.reload()}>
            View Details
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{assessment.title}</CardTitle>
              <CardDescription>{assessment.description}</CardDescription>
            </div>
            {timeRemaining !== null && (
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Clock className={`h-5 w-5 ${timeRemaining < 300 ? 'text-red-500' : ''}`} />
                <span className={timeRemaining < 300 ? 'text-red-500' : ''}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress: {answeredCount} / {assessment.questions.length} answered</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Question {currentQuestionIndex + 1} of {assessment.questions.length}
            </CardTitle>
            <Badge variant="outline">
              {currentQuestion.points || 1} {currentQuestion.points === 1 ? 'point' : 'points'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg">{currentQuestion.question_text}</div>

          {currentQuestion.type === 'multiple_choice' && (
            <RadioGroup
              value={answers[currentQuestion.id]?.toString() || ''}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.type === 'true_false' && (
            <RadioGroup
              value={answers[currentQuestion.id]?.toString() || ''}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            >
              <div className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true" className="flex-1 cursor-pointer">True</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false" className="flex-1 cursor-pointer">False</Label>
              </div>
            </RadioGroup>
          )}

          {(currentQuestion.type === 'short_answer' || currentQuestion.type === 'essay') && (
            <Textarea
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              placeholder="Enter your answer here..."
              rows={currentQuestion.type === 'essay' ? 8 : 4}
            />
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => goToQuestion(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {assessment.questions.map((_, index) => (
              <Button
                key={index}
                variant={index === currentQuestionIndex ? 'default' : answers[assessment.questions[index].id] ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => goToQuestion(index)}
                className="w-10 h-10 p-0"
              >
                {index + 1}
              </Button>
            ))}
          </div>

          {currentQuestionIndex === assessment.questions.length - 1 ? (
            <Button onClick={() => handleSubmit(false)}>
              Submit Assessment
            </Button>
          ) : (
            <Button onClick={() => goToQuestion(currentQuestionIndex + 1)}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}