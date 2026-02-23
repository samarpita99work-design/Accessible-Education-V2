import { useState } from "react";
import { useParams, Link } from "wouter";
import { TopBar } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { contentItems, courseOfferings, type ContentFormat } from "@/lib/mock-data";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Type,
  Contrast,
  Maximize,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const FORMAT_LABELS: Record<ContentFormat, string> = {
  original: "Original",
  audio: "Audio",
  captions: "Captions",
  transcript: "Transcript",
  simplified: "Simplified",
  high_contrast: "High Contrast",
  braille: "Braille",
};

export default function ContentViewer() {
  const { id } = useParams<{ id: string }>();
  const ci = contentItems.find((c) => c.id === id);
  const [selectedFormat, setSelectedFormat] = useState<ContentFormat>("original");
  const [playing, setPlaying] = useState(false);
  const [fontSize, setFontSize] = useState([1.0]);
  const [focusMode, setFocusMode] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);
  const totalSections = 8;
  const [progress, setProgress] = useState(35);

  if (!ci) return <div className="p-8 text-center text-muted-foreground">Content not found</div>;

  const co = courseOfferings.find((c) => c.id === ci.courseOfferingId);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 border-b bg-card px-4 py-2 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Link href={co ? `/student/courses/${co.id}` : "/student/courses"}>
            <Button variant="ghost" size="sm" className="gap-1" data-testid="button-back">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </Link>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {co?.course.code} &rsaquo; {ci.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedFormat} onValueChange={(v) => setSelectedFormat(v as ContentFormat)}>
            <SelectTrigger className="w-[140px] text-xs" data-testid="select-format" aria-label="Content format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ci.formats.map((f) => (
                <SelectItem key={f} value={f}>{FORMAT_LABELS[f]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <main id="main-content" className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1440px] p-4 lg:p-6">
          <div role="alert" className="sr-only">
            {ci.title} loaded. {FORMAT_LABELS[selectedFormat]} format selected based on your profile.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {(ci.type === "video" || selectedFormat === "audio") && (
                <Card>
                  <CardContent className="p-0">
                    <div className="aspect-video bg-[#1A2535] rounded-t-md flex items-center justify-center relative">
                      <div className="text-center text-white/60 space-y-2">
                        <Play className="h-12 w-12 mx-auto" />
                        <p className="text-sm">{ci.type === "video" ? "Video Player" : "Audio Player"}</p>
                        {ci.duration && <p className="text-xs">{ci.duration}</p>}
                      </div>
                      {selectedFormat === "captions" && (
                        <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-white text-sm p-2 rounded text-center">
                          [Captions: Welcome to lecture 8 on Neural Networks...]
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <Progress value={35} className="h-1" />
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" aria-label="Skip back 15 seconds" data-testid="button-skip-back">
                            <SkipBack className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPlaying(!playing)}
                            aria-label={playing ? "Pause" : "Play"}
                            data-testid="button-play-pause"
                          >
                            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" aria-label="Skip forward 15 seconds" data-testid="button-skip-forward">
                            <SkipForward className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">1.0x</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedFormat === "braille" && (
                <Card>
                  <CardContent className="p-5">
                    <div aria-live="polite" className="font-mono text-lg leading-relaxed tracking-wider">
                      ⠠⠊⠝⠞⠗⠕⠙⠥⠉⠞⠊⠕⠝ ⠞⠕ ⠠⠝⠑⠥⠗⠁⠇ ⠠⠝⠑⠞⠺⠕⠗⠅⠎
                      <br /><br />
                      ⠠⠁ ⠝⠑⠥⠗⠁⠇ ⠝⠑⠞⠺⠕⠗⠅ ⠊⠎ ⠁ ⠉⠕⠍⠏⠥⠞⠁⠞⠊⠕⠝⠁⠇ ⠍⠕⠙⠑⠇
                      ⠊⠝⠎⠏⠊⠗⠑⠙ ⠃⠽ ⠞⠓⠑ ⠎⠞⠗⠥⠉⠞⠥⠗⠑ ⠕⠋ ⠃⠊⠕⠇⠕⠛⠊⠉⠁⠇
                      ⠝⠑⠥⠗⠁⠇ ⠝⠑⠞⠺⠕⠗⠅⠎⠲
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedFormat !== "braille" && ci.type !== "video" && selectedFormat !== "audio" && (
                <Card>
                  <CardContent className="p-6" style={{ fontSize: `${fontSize[0]}rem` }}>
                    <div className={`prose max-w-none ${selectedFormat === "high_contrast" ? "bg-black text-white p-6 rounded-md" : ""} ${selectedFormat === "simplified" ? "text-lg leading-[1.8]" : ""}`}>
                      {selectedFormat === "simplified" ? (
                        <>
                          <h2 className="font-serif">Section {currentSection}: What is a Neural Network?</h2>
                          <p>A neural network is a computer system that learns from data. It is inspired by how the human brain works.</p>
                          <p>Neural networks have layers of connected nodes. Each node processes information and passes it to the next layer.</p>
                          <div className="flex items-center justify-between mt-6" aria-live="polite">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setCurrentSection(Math.max(1, currentSection - 1))}
                              disabled={currentSection === 1}
                              data-testid="button-prev-section"
                            >
                              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              Section {currentSection} of {totalSections}
                            </span>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setCurrentSection(Math.min(totalSections, currentSection + 1))}
                              disabled={currentSection === totalSections}
                              data-testid="button-next-section"
                            >
                              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <h2 className="font-serif">Introduction to Neural Networks</h2>
                          <p>A neural network is a computational model inspired by the structure of biological neural networks in the human brain. It consists of interconnected nodes (neurons) organized in layers that process information.</p>
                          <h3>Key Concepts</h3>
                          <ul>
                            <li><strong>Neurons:</strong> Basic computational units that receive inputs, apply weights, and produce outputs through activation functions.</li>
                            <li><strong>Layers:</strong> Networks typically have an input layer, one or more hidden layers, and an output layer.</li>
                            <li><strong>Weights:</strong> Parameters that determine the strength of connections between neurons.</li>
                            <li><strong>Activation Functions:</strong> Non-linear functions (ReLU, sigmoid, tanh) that determine neuron output.</li>
                          </ul>
                          <h3>Training Process</h3>
                          <p>Neural networks learn by adjusting weights through a process called backpropagation. The network makes predictions, calculates error using a loss function, and updates weights to minimize error.</p>
                          <p>The learning rate controls how much weights change in each iteration. Too high leads to instability; too low leads to slow convergence.</p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              {selectedFormat === "transcript" || ci.type === "video" ? (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="text-sm font-semibold">Transcript</h3>
                    <div className="space-y-2 max-h-[400px] overflow-auto text-sm">
                      {[
                        { time: "0:00", text: "Good morning everyone. Today we're going to discuss neural networks." },
                        { time: "0:45", text: "Let's start with the basic architecture of a neural network." },
                        { time: "1:24", text: "A neural network consists of layers of interconnected nodes." },
                        { time: "2:10", text: "The input layer receives raw data from the outside world." },
                        { time: "3:00", text: "Hidden layers transform the data through weighted connections." },
                        { time: "4:15", text: "The output layer produces the final prediction or classification." },
                        { time: "5:30", text: "Each connection has a weight that is adjusted during training." },
                      ].map((entry) => (
                        <button
                          key={entry.time}
                          className="flex gap-2 text-left w-full p-1.5 rounded hover-elevate"
                          data-testid={`button-transcript-${entry.time}`}
                        >
                          <span className="text-xs text-muted-foreground font-mono shrink-0 w-10">{entry.time}</span>
                          <span className="text-xs">{entry.text}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="text-sm font-semibold">Content Info</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="capitalize">{ci.type}</span></div>
                    {ci.duration && <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span>{ci.duration}</span></div>}
                    {ci.fileSize && <div className="flex justify-between"><span className="text-muted-foreground">Size</span><span>{ci.fileSize}</span></div>}
                    <div className="flex justify-between"><span className="text-muted-foreground">Views</span><span>{ci.viewCount}</span></div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Available Formats</p>
                    <div className="flex flex-wrap gap-1">
                      {ci.formats.map((f) => (
                        <Badge
                          key={f}
                          variant={f === selectedFormat ? "default" : "outline"}
                          className="no-default-active-elevate text-[10px] cursor-pointer"
                          onClick={() => setSelectedFormat(f)}
                          data-testid={`button-format-${f}`}
                        >
                          {FORMAT_LABELS[f]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <div className="flex items-center justify-between gap-2 border-t bg-card px-4 py-2 sticky bottom-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs"
            onClick={() => setPlaying(!playing)}
            aria-label={playing ? "Stop reading" : "Read aloud"}
            aria-pressed={playing}
            data-testid="button-tts"
          >
            <Volume2 className="h-3.5 w-3.5" /> TTS
          </Button>
          <div className="flex items-center gap-2 hidden sm:flex">
            <Type className="h-3.5 w-3.5 text-muted-foreground" />
            <Slider
              className="w-20"
              min={0.5}
              max={3.0}
              step={0.1}
              value={fontSize}
              onValueChange={setFontSize}
              aria-valuetext={`Font size: ${fontSize[0].toFixed(1)}x`}
              aria-label="Font size"
              data-testid="slider-viewer-font-size"
            />
            <span className="text-xs text-muted-foreground w-8">{fontSize[0].toFixed(1)}x</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs"
            aria-label="Toggle high contrast"
            aria-pressed={selectedFormat === "high_contrast"}
            data-testid="button-contrast"
          >
            <Contrast className="h-3.5 w-3.5" /> Contrast
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs"
            onClick={() => setFocusMode(!focusMode)}
            aria-label={focusMode ? "Exit focus mode" : "Enter focus mode"}
            aria-pressed={focusMode}
            data-testid="button-focus-mode"
          >
            <Maximize className="h-3.5 w-3.5" /> Focus
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Progress: {progress}%</span>
          <Progress value={progress} className="w-24 h-1.5" />
        </div>
      </div>
    </div>
  );
}
