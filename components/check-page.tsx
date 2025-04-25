"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, FileText, Loader2, Sparkles, Linkedin, Twitter } from "lucide-react"; 
import { Progress } from "@/components/ui/progress";

interface ApiAnalysisResponse {
  replaceability_score: number;
  confidence: number; 
  commentary: string;
}

export default function CheckPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [skills, setSkills] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState<ApiAnalysisResponse | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)) {
         toast.error("Invalid File Type", {
           description: "Please upload a PDF, DOC, or DOCX file.",
           className: "bg-gray-900 text-white border border-gray-800",
           descriptionClassName: "text-gray-300"
         });
         setFile(null); 
         e.target.value = "";
         return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
         toast.error("File Too Large", {
           description: "Maximum file size is 5MB.",
           className: "bg-gray-900 text-white border border-gray-800",
           descriptionClassName: "text-gray-300"
         });
         setFile(null); 
         e.target.value = "";
         return;
      }

      setFile(selectedFile);
      toast.success("Resume selected", {
        description: `${selectedFile.name}`,
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

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
       if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(droppedFile.type)) {
         toast.error("Invalid File Type", {
           description: "Please drop a PDF, DOC, or DOCX file.",
           className: "bg-gray-900 text-white border border-gray-800",
           descriptionClassName: "text-gray-300"
         });
         return;
       }
       if (droppedFile.size > 5 * 1024 * 1024) {
         toast.error("File Too Large", {
           description: "Maximum file size is 5MB.",
           className: "bg-gray-900 text-white border border-gray-800",
           descriptionClassName: "text-gray-300"
         });
         return;
       }

      setFile(droppedFile);
      toast.success("Resume dropped", {
        description: `${droppedFile.name} has been successfully selected.`,
        className: "bg-gray-900 text-white border border-gray-800",
        descriptionClassName: "text-gray-300"
      });
    }
  };

  const getRiskLevel = (score: number | undefined): { level: string; color: string } => {
    if (score === undefined || score === null) return { level: "Unknown", color: "text-gray-500" };
    if (score >= 70) return { level: "High", color: "text-red-500" };
    if (score >= 40) return { level: "Medium", color: "text-yellow-500" };
    return { level: "Low", color: "text-green-500" };
  };


  const shareToLinkedIn = () => {
    if (!results) return;

    const shareText = `My AI replaceability score is ${results.replaceability_score}% on Replacify! Their take: "${results.commentary}" Check yours at replacify.ai`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://replacify.ai')}&title=${encodeURIComponent(shareText)}`; // Use your actual site URL
    window.open(url, '_blank');
    toast.success("Sharing to LinkedIn", {
      className: "bg-gray-900 text-white border border-gray-800",
      descriptionClassName: "text-gray-300"
    });
  };

  const shareToTwitter = () => {
    if (!results) return;

    const shareText = `My AI replaceability score is ${results.replaceability_score}% on Replacify! \n\nTheir take: "${results.commentary}" \n\nCheck yours: replacify.ai`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`; // Twitter usually picks up the URL from the text now
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
        description: "Please upload or drop your resume.",
        className: "bg-gray-900 text-white border border-gray-800",
        descriptionClassName: "text-gray-700"
      });
      return;
    }

    if (!skills.trim()) {
      toast.error("Missing skills", {
        description: "Please enter your skills.",
        className: "bg-gray-900 text-white border border-gray-800",
        descriptionClassName: "text-gray-700"
      });
      return;
    }

    setIsSubmitting(true);
    setResults(null);
    setShowResults(false); 
    const clearProgressInterval = simulateUploadProgress();

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('skills', skills); 

      const response = await fetch('/api/llmbuddy', {
        method: 'POST',
        body: formData,
      });

      clearProgressInterval();

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || `API Error: ${response.statusText}`;
        } catch (parseError) {
          errorMsg = `Failed to process: ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      setUploadProgress(100);

      const responseData = await response.json();

      if (responseData.data && typeof responseData.data.replaceability_score === 'number' && typeof responseData.data.commentary === 'string') {
        setResults(responseData.data); 
        setShowResults(true); 

        toast.success("Analysis complete!", {
          description: "Your replaceability score is ready.",
          className: "bg-gray-900 text-white border border-gray-800",
          descriptionClassName: "text-gray-300"
        });
      } else {
        console.error("Unexpected API response structure:", responseData);
        throw new Error(responseData.message || 'Received unexpected data format from API');
      }

    } catch (error) {
      setUploadProgress(0);
      toast.error("Processing failed", {
        description: error instanceof Error ? error.message : "Something went wrong, please try again.",
        className: "bg-gray-900 text-white border border-gray-800",
        descriptionClassName: "text-gray-300"
      });
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckAgain = () => {
    setShowResults(false);
    setFile(null);
    setSkills("");
    setResults(null);
    setUploadProgress(0);
    const fileInput = document.getElementById('resume') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-fuchsia-900/20 to-purple-900/30 animate-gradient-slow z-0"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDBNIDAgMjAgTCA0MCAyMCBNIDIwIDAgTCAyMCA0MCBNIDAgMzAgTCA0MCAzMCBNIDMwIDAgTCAzMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40 z-0 animate-pulse-slow"></div>

      <div className="absolute top-8 left-8 z-20">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500 animate-gradient cursor-pointer" onClick={() => router.push("/")}>
          Replacify
        </h2>
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto transition-all duration-500 ease-in-out">
        {!showResults ? (
          <Card className="bg-black/50 border border-gray-800 backdrop-blur-md shadow-xl rounded-lg"> {/* Slightly rounded corners */}
            <CardHeader>
              <CardTitle className="text-xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-violet-500">
                Check Your AI Replaceability
              </CardTitle>
              <CardDescription className="text-center text-sm text-gray-300">
                Upload resume, enter skills. Get the brutal truth.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="resume" className="text-gray-300">Upload Resume</Label>
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
                    disabled={isSubmitting} 
                  />

                  {file ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-12 w-12 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-fuchsia-400" />
                      </div>
                      <div className="text-sm text-fuchsia-400 font-medium truncate max-w-[200px] md:max-w-[300px]">{file.name}</div>
                      <p className="text-xs text-gray-400">Ready to analyze. Click below or drop a new file.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="text-sm font-medium text-gray-300">
                        Drag & drop or <span className="text-fuchsia-400">browse</span>
                      </div>
                      <p className="text-xs text-gray-400">PDF, DOC, DOCX only (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills" className="text-gray-300">Your Core Skills</Label>
                <Textarea
                  id="skills"
                  placeholder="Enter skills, comma-separated (e.g., Python, welding, closing deals, creative writing)"
                  className="bg-black/50 border-gray-800 focus:border-fuchsia-500 placeholder:text-gray-500 text-gray-300" // Slightly lighter text
                  rows={3} 
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  disabled={isSubmitting} 
                />
              </div>

              {isSubmitting && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Analyzing...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2 bg-gray-800 [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-fuchsia-500" /> {/* Gradient progress */}
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                type="submit" 
                className="w-full bg-gradient-to-r from-cyan-500 via-fuchsia-600 to-violet-600 hover:from-cyan-600 hover:via-fuchsia-700 hover:to-violet-700 text-white font-bold py-3 rounded-md transform hover:scale-[1.02] transition-all duration-300 shadow-[0_0_20px_rgba(192,38,211,0.3)] hover:shadow-[0_0_30px_rgba(192,38,211,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
                onClick={handleSubmit}
                disabled={isSubmitting || !file || !skills.trim()} 
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Thinking...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" /> Get Score
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="bg-black/50 border border-gray-800 backdrop-blur-md shadow-xl overflow-hidden rounded-lg animate-fade-in"> {/* Added fade-in animation */}
            <CardHeader className="relative pb-4"> 
              <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-violet-500">
                Your Verdict
              </CardTitle>
              <CardDescription className="text-center text-sm text-gray-400">
                Here's the AI's take. No sugar coating.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6"> 
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-40 h-40 md:w-48 md:h-48"> 
                  <div className="absolute inset-0 rounded-full bg-black/50 border-4 border-gray-800 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-fuchsia-500 border-r-cyan-500 animate-spin-slow"></div>
                    <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                      {results?.replaceability_score}%
                    </div>
                  </div>
                </div>
                <div className="mt-5 text-center">
                  {(() => { // iife to calculate risk level inline
                    const riskInfo = getRiskLevel(results?.replaceability_score);
                    return (
                      <div className="text-lg font-semibold text-white mb-1">
                        AI Replaceability Risk: <span className={`${riskInfo.color} font-bold`}>{riskInfo.level}</span>
                      </div>
                    );
                  })()}
                  <p className="text-base text-gray-300 mt-2 max-w-lg leading-relaxed font-mono bg-gray-900/40 p-4 rounded-md border border-gray-700">
                    {results?.commentary}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-3 pt-4 border-t border-gray-800"> 
                <div className="text-sm text-gray-400">Share the bad news:</div>
                <div className="flex space-x-4"> 
                  <Button
                    onClick={shareToLinkedIn}
                    variant="outline"
                    size="icon"
                    className="rounded-full border-gray-700 bg-black/50 hover:bg-blue-600/20 hover:border-blue-600 transition-colors duration-200"
                    aria-label="Share on LinkedIn"
                  >
                    <Linkedin className="h-5 w-5 text-blue-500" />
                  </Button>
                  <Button
                    onClick={shareToTwitter}
                    variant="outline"
                    size="icon"
                    className="rounded-full border-gray-700 bg-black/50 hover:bg-sky-500/20 hover:border-sky-500 transition-colors duration-200" // Use sky for Twitter blue
                     aria-label="Share on Twitter"
                 >
                    <Twitter className="h-5 w-5 text-sky-500" />
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-600 hover:from-purple-700 hover:via-fuchsia-700 hover:to-cyan-700 text-white font-bold py-3 rounded-md transform hover:scale-[1.02] transition-all duration-300 shadow-[0_0_20px_rgba(192,38,211,0.3)] hover:shadow-[0_0_30px_rgba(192,38,211,0.5)]"
                onClick={handleCheckAgain} 
              >
                Check Another Role (or Cry Again)
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}