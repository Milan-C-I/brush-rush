"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, Users, Palette, MessageCircle, Trophy, Clock, Lightbulb, Target, Zap } from "lucide-react"
import Link from "next/link"

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 p-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">How to Play</h1>
          </div>

          <Link href="/game">
            <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
              <Play className="w-4 h-4 mr-2" />
              Start Playing
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Game Overview */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to DrawTogether!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-lg leading-relaxed">
              DrawTogether is a multiplayer drawing and guessing game where creativity meets competition. Take turns
              drawing words while others guess what you're creating. Earn points for correct guesses and successful
              drawings. The faster you guess, the more points you earn!
            </p>
          </CardContent>
        </Card>

        {/* Game Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-blue-400" />
                1. Join a Room
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">
                Create a new room or join an existing one. Rooms can be public or private with passwords.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="w-5 h-5 text-purple-400" />
                2. Draw Your Word
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">
                When it's your turn, you'll get a secret word to draw. Use the drawing tools to illustrate it.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="w-5 h-5 text-green-400" />
                3. Guess & Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">
                When others are drawing, type your guesses in the chat. First correct guess gets the most points!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-yellow-400" />
                4. Win Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">
                Earn points for correct guesses and successful drawings. Player with most points wins!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Drawing Tools */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-400" />
              Drawing Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Available Tools</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-16">
                      Brush
                    </Badge>
                    <span className="text-gray-300">Draw with customizable size and opacity</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-16">
                      Eraser
                    </Badge>
                    <span className="text-gray-300">Remove parts of your drawing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-16">
                      Colors
                    </Badge>
                    <span className="text-gray-300">Choose from preset colors or create custom ones</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-16">
                      Clear
                    </Badge>
                    <span className="text-gray-300">Start over with a blank canvas</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-white">Keyboard Shortcuts</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Undo</span>
                    <kbd className="px-2 py-1 bg-slate-600 rounded">Ctrl+Z</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Redo</span>
                    <kbd className="px-2 py-1 bg-slate-600 rounded">Ctrl+Y</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Brush Tool</span>
                    <kbd className="px-2 py-1 bg-slate-600 rounded">B</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Eraser Tool</span>
                    <kbd className="px-2 py-1 bg-slate-600 rounded">E</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Clear Canvas</span>
                    <kbd className="px-2 py-1 bg-slate-600 rounded">Ctrl+Del</kbd>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scoring System */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-red-400" />
              Scoring System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <h4 className="font-semibold text-white">Speed Bonus</h4>
                </div>
                <p className="text-gray-300 text-sm">
                  Guess correctly faster to earn more points. The timer affects your final score!
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <h4 className="font-semibold text-white">Difficulty Multiplier</h4>
                </div>
                <p className="text-gray-300 text-sm">
                  Harder words give more points. Easy words: 1x, Medium: 1.5x, Hard: 2x multiplier.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-green-400" />
                  <h4 className="font-semibold text-white">Drawer Bonus</h4>
                </div>
                <p className="text-gray-300 text-sm">
                  As the drawer, you earn 50% of the points that guessers receive for your drawing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hints System */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-green-400" />
              Hint System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-300">
                As time passes during each round, hints will gradually appear to help players guess the word:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-2">50%</div>
                    <div className="text-sm text-gray-300">First letter revealed</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400 mb-2">70%</div>
                    <div className="text-sm text-gray-300">Second letter revealed</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400 mb-2">90%</div>
                    <div className="text-sm text-gray-300">Third letter revealed</div>
                  </div>
                </div>
              </div>

              <p className="text-gray-400 text-sm">* Hint timing can be customized by room hosts in game settings</p>
            </div>
          </CardContent>
        </Card>

        {/* Tips & Strategies */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle>Tips & Strategies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-white">For Drawers</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Start with basic shapes and outlines</li>
                  <li>• Focus on the most recognizable features</li>
                  <li>• Use different brush sizes for details</li>
                  <li>• Don't worry about perfect art - clarity matters most</li>
                  <li>• Use the undo feature to fix mistakes quickly</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-white">For Guessers</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Think about the category being drawn</li>
                  <li>• Look for key details and shapes</li>
                  <li>• Try common words first, then get creative</li>
                  <li>• Pay attention to the word length hints</li>
                  <li>• Don't give up - keep guessing until time runs out</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ready to Play */}
        <Card className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/30">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Drawing?</h3>
            <p className="text-gray-300 mb-6">Join thousands of players in creative multiplayer drawing battles!</p>
            <Link href="/">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <Play className="w-5 h-5 mr-2" />
                Play Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
