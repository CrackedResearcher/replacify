"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, FileText, Loader2, Sparkles, Share2, Linkedin, Twitter } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function CheckPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [skills, setSkills] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState<{
    score: number;
    riskLevel: string;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  } | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast.success("Resume uploaded, wait now a lil bit", {
        className: "bg-gray-900 text-white border border-gray-800",
        descriptionClassName: "text-gray-300"
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      toast.success("Resume uploaded", {
        description: `${e.dataTransfer.files[0].name} has been successfully uploaded.`,
        className: "bg-gray-900 text-white border border-gray-800",
        descriptionClassName: "text-gray-300"
      });
    }
  };

  const shareToLinkedIn = () => {
    if (!results) return;
    
    const shareText = `I just discovered my AI replaceability score is ${results.score}% on Replacify! ${results.summary} Check your score at replacify.ai`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
    toast.success("Sharing to LinkedIn", {
      className: "bg-gray-900 text-white border border-gray-800",
      descriptionClassName: "text-gray-300"
    });
  };

  const shareToTwitter = () => {
    if (!results) return;
    
    const shareText = `I just discovered my AI replaceability score is ${results.score}% on Replacify! ${results.summary} Check your score at replacify.ai`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
    toast.success("Sharing to Twitter", {
      className: "bg-gray-900 text-white border border-gray-800",
      descriptionClassName: "text-gray-300"
    });
  };

  const simulateUploadProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 150);
    
    return () => clearInterval(interval);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("Missing resume", {
        description: "Please upload your resume to continue.",
        className: "bg-gray-900 text-white border border-gray-800",
        descriptionClassName: "text-gray-700"
      });
      return;
    }
    
    if (!skills.trim()) {
      toast.error("Missing skills", {
        description: "Please enter your skills to continue.",
        className: "bg-gray-900 text-white border border-gray-800",
        descriptionClassName: "text-gray-700"
      });
      return;
    }
    
    setIsSubmitting(true);
    const progressInterval = simulateUploadProgress();
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('skills', skills);
      
      // Send request to API endpoint
    //   const response = await fetch('/api/llmbuddy', {
    //     method: 'POST',
    //     body: formData,
    //   });
      
    //   if (!response.ok) {
    //     throw new Error('Failed to process your data');
    //   }
      
      // Clear progress interval and set progress to 100
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Parse API response
    //   const data = await response.json();
      
      // Example data structure (in case the API isn't implemented yet)
      const mockData = {
        score: 76,
        riskLevel: "High",
        summary: "Your job is at significant risk of automation within 3-5 years.",
        strengths: [
          "Creative problem solving skills",
          "Complex communication abilities",
          "Project management experience"
        ],
        weaknesses: [
          "Routine data processing tasks",
          "Basic document preparation",
          "Repetitive analysis work"
        ],
        recommendations: [
          "Develop expertise in AI-human collaboration",
          "Focus on emotional intelligence and leadership",
          "Gain skills in areas requiring human judgment"
        ]
      };
      
      // Use actual data or mock data if testing
      setResults(mockData);
      setShowResults(true);
      
      toast.success("Analysis complete!", {
        description: "Your replaceability score is ready to view.",
        className: "bg-gray-900 text-white border border-gray-800",
        descriptionClassName: "text-gray-300"
      });
    } catch (error) {
      toast.error("Processing failed", {
        description: error instanceof Error ? error.message : "Something went wrong, please try again.",
        className: "bg-gray-900 text-white border border-gray-800",
        descriptionClassName: "text-gray-300"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      {/* Sonner Toast Provider */}

      
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-fuchsia-900/20 to-purple-900/30 animate-gradient-slow z-0"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDBNIDAgMjAgTCA0MCAyMCBNIDIwIDAgTCAyMCA0MCBNIDAgMzAgTCA0MCAzMCBNIDMwIDAgTCAzMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40 z-0 animate-pulse-slow"></div>
      
      {/* Logo in top left */}
      <div className="absolute top-8 left-8 z-20">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500 animate-gradient cursor-pointer" onClick={() => router.push("/")}>
          Replacify
        </h2>
      </div>
      
      <div className="relative z-10 w-full max-w-3xl mx-auto">
        {!showResults ? (
          // Form Card
          <Card className="bg-black/50 border border-gray-800 backdrop-blur-md shadow-xl rounded-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-violet-500">
                Check Your Replaceability Score
              </CardTitle>
              <CardDescription className="text-center text-sm text-gray-300">
                Upload your resume and skills to see how replaceable you are by AI
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 ">
              {/* Resume upload section */}
              <div className="space-y-2">
                <Label htmlFor="resume" className="text-gray-300 mb-3">Upload Your Resume</Label>
                <div 
                  className={`border-2 border-dashed rounded-md p-6 text-center ${file ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'border-gray-700 hover:border-fuchsia-400 bg-black/30'} cursor-pointer transition-colors duration-300`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('resume')?.click()}
                >
                  <input 
                    id="resume" 
                    type="file" 
                    accept=".pdf,.doc,.docx" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                  
                  {file ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-12 w-12 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-fuchsia-400" />
                      </div>
                      <div className="text-sm text-fuchsia-400 font-medium">{file.name}</div>
                      <p className="text-xs text-gray-400">File uploaded successfully</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="text-sm font-medium text-gray-300">
                        Drag & drop your resume here or <span className="text-fuchsia-400">browse</span>
                      </div>
                      <p className="text-xs text-gray-400">Supports PDF, DOC, DOCX (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Skills input section */}
              <div className="space-y-2">
                <Label htmlFor="skills" className="text-gray-300 mb-3">Your Skills</Label>
                <Textarea 
                  id="skills"
                  placeholder="Enter your skills separated by commas (e.g., Python, Project Management, UI/UX Design)"
                  className="bg-black/50 border-gray-800 focus:border-fuchsia-500 placeholder:text-gray-500 text-gray-400"
                  rows={4}
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>
              
              {/* Progress bar shows when uploading */}
              {isSubmitting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Analyzing your data...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2 bg-gray-800" />
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full bg-gradient-to-r from-cyan-500 via-fuchsia-600 to-violet-600 hover:from-cyan-600 hover:via-fuchsia-700 hover:to-violet-700 text-white font-bold py-6 rounded-sm transform hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(192,38,211,0.3)] hover:shadow-[0_0_30px_rgba(192,38,211,0.5)]"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" /> Check Your Score
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          // Results Card
          <Card className="bg-black/50 border border-gray-800 backdrop-blur-md shadow-xl overflow-hidden rounded-sm">
            <CardHeader className="relative">
              <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-violet-500 mt-2">
                Your Replaceability Score
              </CardTitle>
              <CardDescription className="text-center text-gray-300">
                getting results for you wasnt hard - super easy.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Score display */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-48 h-48">
                  <div className="absolute inset-0 rounded-full bg-black/50 border-4 border-gray-800 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-fuchsia-500 border-r-cyan-500 animate-spin-slow"></div>
                    <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                      {results?.score}%
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-lg font-bold text-white">Risk Level: <span className={`${
                    results?.riskLevel === "High" ? "text-red-500" : 
                    results?.riskLevel === "Medium" ? "text-yellow-500" : 
                    "text-green-500"
                  }`}>{results?.riskLevel}</span></div>
                  <p className="text-sm text-gray-300 mt-2 max-w-lg">{results?.summary}</p>
                </div>
              </div>
              
              {/* Strengths and Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-cyan-400">Some commentary</h3>
                  <ul className="space-y-2">
                    {results?.strengths.map((strength, index) => (
                      <li key={`strength-${index}`} className="flex items-start">
                        <div className="mr-2 mt-1 h-2 w-2 rounded-full bg-cyan-500"></div>
                        <span className="text-sm text-gray-300">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Share buttons */}
              <div className="flex flex-col items-center space-y-4">
                <div className="text-sm text-gray-400">Share your results:</div>
                <div className="flex space-x-3">
                  <Button 
                    onClick={shareToLinkedIn}
                    variant="outline" 
                    size="icon"
                    className="rounded-full border-gray-700 bg-black/50 hover:bg-blue-600/20 hover:border-blue-600 transition-colors"
                  >
                    <Linkedin className="h-5 w-5 text-blue-500" />
                  </Button>
                  <Button 
                    onClick={shareToTwitter}
                    variant="outline" 
                    size="icon"
                    className="rounded-full border-gray-700 bg-black/50 hover:bg-blue-400/20 hover:border-blue-400 transition-colors"
                  >
                    <Twitter className="h-5 w-5 text-blue-400" />
                  </Button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-600 hover:from-purple-700 hover:via-fuchsia-700 hover:to-cyan-700 text-white font-bold py-4 rounded-sm transform hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(192,38,211,0.3)] hover:shadow-[0_0_30px_rgba(192,38,211,0.5)]"
                onClick={() => setShowResults(false)}
              >
                Have doubts? Check Again
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}