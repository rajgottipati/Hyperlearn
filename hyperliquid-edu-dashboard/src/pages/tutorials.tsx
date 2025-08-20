import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Code, Clock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tutorials, getCategories, getDifficulties } from '@/lib/tutorials';
import { useUser } from '@/lib/store';
import { cn } from '@/lib/utils';

const categoryIcons = {
  'API Fundamentals': Code,
  'Real-time Data': BookOpen,
  'Wallet Integration': User,
  'Account Management': BookOpen,
};

export function TutorialsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  
  const user = useUser();
  const categories = ['all', ...getCategories()];
  const difficulties = ['all', ...getDifficulties()];

  // Filter tutorials
  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = searchTerm === '' || 
      tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutorial.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = selectedDifficulty === 'all' || tutorial.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
    
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const stats = {
    total: tutorials.length,
    completed: user.progress ? Object.values(user.progress).filter(p => p.completed).length : 0,
    inProgress: user.progress ? Object.values(user.progress).filter(p => !p.completed && p.completed_steps.length > 0).length : 0
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Interactive Tutorials
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Master Hyperliquid development through hands-on, interactive tutorials with real API integration
          </p>
          
          {/* Stats */}
          <div className="flex gap-6 mb-8">
            <div className="bg-card rounded-lg px-4 py-3 border">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Tutorials</div>
            </div>
            <div className="bg-card rounded-lg px-4 py-3 border">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="bg-card rounded-lg px-4 py-3 border">
              <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search tutorials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {difficulties.map(difficulty => (
                <Button
                  key={difficulty}
                  variant={selectedDifficulty === difficulty ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDifficulty(difficulty)}
                >
                  {difficulty}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons];
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="flex items-center gap-1"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {category}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredTutorials.length} tutorials
            {searchTerm && ` matching "${searchTerm}"`}
            {selectedDifficulty !== 'all' && ` • ${selectedDifficulty} level`}
            {selectedCategory !== 'all' && ` • ${selectedCategory} category`}
          </p>
        </div>

        {/* Tutorials Grid */}
        {filteredTutorials.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tutorials found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutorials.map((tutorial) => {
              const tutorialProgress = user.progress?.[tutorial.id];
              const progressPercent = tutorialProgress ? 
                Math.round((tutorialProgress.completed_steps.length / tutorial.steps.length) * 100) : 
                0;
              
              return (
                <TutorialCard
                  key={tutorial.id}
                  tutorial={tutorial}
                  progress={progressPercent}
                  completed={tutorialProgress?.completed || false}
                />
              );
            })}
          </div>
        )}

        {/* Learning Path Suggestions */}
        {selectedCategory === 'all' && searchTerm === '' && (
          <div className="mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4">Recommended Learning Path</h2>
            <p className="text-muted-foreground mb-6">
              New to Hyperliquid? Follow this suggested path to build your skills progressively.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: 1, tutorial: tutorials[0], title: "Start Here" },
                { step: 2, tutorial: tutorials[1], title: "Real-time Data" },
                { step: 3, tutorial: tutorials[2], title: "Authentication" },
                { step: 4, tutorial: tutorials[3], title: "Account Data" }
              ].map(({ step, tutorial, title }) => (
                <Card key={step} className="bg-white dark:bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Step {step}</Badge>
                      <span className="text-sm font-medium">{title}</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{tutorial.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {tutorial.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface TutorialCardProps {
  tutorial: any;
  progress: number;
  completed: boolean;
}

function TutorialCard({ tutorial, progress, completed }: TutorialCardProps) {
  const difficultyColor = {
    'Beginner': 'bg-green-100 text-green-800 border-green-200',
    'Intermediate': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Advanced': 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <Card className="card-hover group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {tutorial.title}
          </CardTitle>
          <Badge 
            variant="outline"
            className={cn("text-xs", difficultyColor[tutorial.difficulty as keyof typeof difficultyColor])}
          >
            {tutorial.difficulty}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {tutorial.description}
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {tutorial.duration}
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {tutorial.steps.length} steps
          </div>
        </div>
        
        <div className="mb-4">
          <Badge variant="secondary" className="text-xs">
            {tutorial.category}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        {progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="tutorial-progress h-2">
              <div 
                className="tutorial-progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        <Link to={`/tutorials/${tutorial.id}`}>
          <Button className="w-full group">
            {completed ? 'Review Tutorial' : progress > 0 ? 'Continue' : 'Start Tutorial'}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}