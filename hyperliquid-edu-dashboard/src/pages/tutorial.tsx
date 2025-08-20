import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, User, Lightbulb, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTutorialById } from '@/lib/tutorials';
import { useAppStore } from '@/lib/store';
import { hyperliquidClient } from '@/lib/hyperliquid-client';
import { updateUserProgress } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function TutorialPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, setUser } = useAppStore();
  
  const [tutorial, setTutorial] = useState(getTutorialById(id!));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [codeOutput, setCodeOutput] = useState('');

  // Initialize demo user if no user exists
  useEffect(() => {
    if (!user.user) {
      setUser({
        id: 'demo-user',
        wallet_address: 'demo-wallet-address',
        username: 'Demo User',
        xp_points: 0,
        level: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }, [user.user, setUser]);

  // Load saved progress for this tutorial
  useEffect(() => {
    if (tutorial && user.progress[tutorial.id]) {
      const savedProgress = user.progress[tutorial.id];
      setCurrentStepIndex(savedProgress.current_step || 0);
    }
  }, [tutorial, user.progress]);

  useEffect(() => {
    if (!tutorial) {
      navigate('/tutorials');
      return;
    }
  }, [tutorial, navigate]);

  if (!tutorial) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Tutorial Not Found</h1>
          <p className="text-muted-foreground mb-6">The tutorial you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/tutorials')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Tutorials
          </Button>
        </div>
      </div>
    );
  }

  const currentStep = tutorial.steps[currentStepIndex];
  const userProgress = user.progress?.[tutorial.id];
  const isStepCompleted = userProgress?.completed_steps?.includes(currentStep.id) || false;
  const progressPercentage = ((currentStepIndex + 1) / tutorial.steps.length) * 100;

  const handleRunCode = async () => {
    setIsRunningCode(true);
    setCodeOutput('Executing code...');
    
    try {
      // Check if this step requires wallet connection
      const requiresWallet = currentStep.code.includes('getAccountState') ||
                           currentStep.code.includes('getUserFills') ||
                           currentStep.code.includes('userAddress');
      
      if (requiresWallet && !user.user) {
        throw new Error('This step requires a connected wallet. Please connect your wallet to continue.');
      }

      // Execute real API call using the step's code
      const result = await hyperliquidClient.executeUserCode(
        currentStep.code,
        user.user?.wallet_address
      );
      
      // Format the output
      let output = '';
      if (currentStep.expectedOutput) {
        output = currentStep.expectedOutput;
      } else {
        output = JSON.stringify(result, null, 2);
      }
      
      setCodeOutput(`✅ Code executed successfully!\n\n${output}`);
      
      // Mark step as completed and update progress
      await completeStep();
      
      toast.success('Tutorial step completed!', {
        description: `+${currentStep.xpReward} XP earned`
      });
      
    } catch (error: any) {
      const errorMessage = error.message || 'Code execution failed';
      setCodeOutput(`❌ Execution failed\n\nError: ${errorMessage}\n\nTip: Make sure you have the required wallet connection and valid parameters.`);
      
      toast.error('Code execution failed', {
        description: errorMessage
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  const completeStep = async () => {
    try {
      const { updateProgress } = useAppStore.getState();
      const updatedSteps = [...(userProgress?.completed_steps || []), currentStep.id];
      const isLastStep = currentStepIndex === tutorial.steps.length - 1;
      
      const progressData = {
        id: tutorial.id,
        user_id: user.user?.id || 'demo-user',
        tutorial_id: tutorial.id,
        completed_steps: updatedSteps,
        current_step: currentStepIndex + 1,
        completed: isLastStep,
        time_spent: (userProgress?.time_spent || 0) + 5, // Add 5 minutes for completing step
        xp_earned: (userProgress?.xp_earned || 0) + currentStep.xpReward,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Save to local store (which includes localStorage via persist)
      updateProgress(tutorial.id, progressData);
      
      // Try to save to Supabase if available
      if (user.user && user.user.id !== 'demo-user') {
        try {
          await updateUserProgress(user.user.id, tutorial.id, {
            completed_steps: updatedSteps,
            current_step: currentStepIndex + 1,
            completed: isLastStep,
            time_spent: (userProgress?.time_spent || 0) + 5,
            xp_earned: (userProgress?.xp_earned || 0) + currentStep.xpReward
          });
        } catch (supabaseError) {
          console.log('Supabase save failed, using local storage only');
        }
      }
      
      toast.success(`Step completed! +${currentStep.xpReward} XP`);
    } catch (error: any) {
      toast.error('Failed to save progress');
    }
  };

  const nextStep = () => {
    if (currentStepIndex < tutorial.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setShowHints(false);
      setCodeOutput('');
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setShowHints(false);
      setCodeOutput('');
    }
  };

  const resetTutorial = () => {
    setCurrentStepIndex(0);
    setShowHints(false);
    setCodeOutput('');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/tutorials')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Tutorials
            </Button>
            <div className="h-4 w-px bg-border" />
            <Badge variant="secondary">{tutorial.category}</Badge>
            <Badge className={cn(
              "text-xs",
              tutorial.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              tutorial.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            )}>
              {tutorial.difficulty}
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">{tutorial.title}</h1>
          <p className="text-lg text-muted-foreground mb-4">{tutorial.description}</p>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {tutorial.duration}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {tutorial.steps.length} steps
            </div>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="tutorial-progress h-2">
              <div 
                className="tutorial-progress-bar"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {currentStep.title}
                  {isStepCompleted && <CheckCircle className="h-6 w-6 text-green-500" />}
                </h2>
                <p className="text-muted-foreground">
                  Step {currentStepIndex + 1} of {tutorial.steps.length}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetTutorial}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Step Content */}
            <Card>
              <CardContent className="p-6">
                <div className="prose prose-gray dark:prose-invert max-w-none mb-6">
                  {currentStep.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Code Editor */}
            {currentStep.code && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interactive Code Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
                    <pre><code>{currentStep.code}</code></pre>
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                    <Button 
                      onClick={handleRunCode} 
                      disabled={isRunningCode}
                      className="flex items-center gap-2"
                    >
                      {isRunningCode ? 'Running...' : 'Run Code'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigator.clipboard.writeText(currentStep.code!)}
                    >
                      Copy Code
                    </Button>
                  </div>
                  
                  {codeOutput && (
                    <div className="bg-black text-green-400 rounded-lg p-4 font-mono text-sm">
                      <pre>{codeOutput}</pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Hints */}
            {currentStep.hints && currentStep.hints.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Hints
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHints(!showHints)}
                    >
                      {showHints ? 'Hide' : 'Show'} Hints
                    </Button>
                  </div>
                </CardHeader>
                {showHints && (
                  <CardContent>
                    <ul className="space-y-2">
                      {currentStep.hints.map((hint, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground font-medium">💡</span>
                          <span className="text-sm">{hint}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStepIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous Step
              </Button>

              <div className="flex items-center gap-2">
                {!isStepCompleted && user.user && (
                  <Button onClick={completeStep} variant="outline">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark Complete
                  </Button>
                )}
                
                <Button
                  onClick={nextStep}
                  disabled={currentStepIndex >= tutorial.steps.length - 1}
                >
                  Next Step
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 space-y-6">
              {/* Step Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tutorial Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tutorial.steps.map((step, index) => {
                      const isCompleted = userProgress?.completed_steps?.includes(step.id) || false;
                      const isCurrent = index === currentStepIndex;
                      
                      return (
                        <div
                          key={step.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                            isCurrent 
                              ? 'bg-primary/10 border border-primary/20' 
                              : 'hover:bg-muted/50'
                          )}
                          onClick={() => setCurrentStepIndex(index)}
                        >
                          <div className={cn(
                            "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : isCurrent
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          )}>
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={cn(
                              "text-sm font-medium truncate",
                              isCurrent ? 'text-primary' : ''
                            )}>
                              {step.title}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Tutorial Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tutorial Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
                    <Badge className={cn(
                      "mt-1",
                      tutorial.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      tutorial.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    )}>
                      {tutorial.difficulty}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estimated Time</p>
                    <p className="text-sm mt-1">{tutorial.duration}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <p className="text-sm mt-1">{tutorial.category}</p>
                  </div>
                  
                  {userProgress && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Your Progress</p>
                      <p className="text-sm mt-1">
                        {userProgress.completed_steps.length} of {tutorial.steps.length} steps completed
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}