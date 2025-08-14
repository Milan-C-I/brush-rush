"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, AlertCircle, Check } from "lucide-react"
import { wordManager, type CustomWordSet } from "@/lib/word-manager"

interface CustomWordsManagerProps {
  isHost: boolean
  onWordsUpdated?: () => void
}

export function CustomWordsManager({ isHost, onWordsUpdated }: CustomWordsManagerProps) {
  const [customSets, setCustomSets] = useState<CustomWordSet[]>(wordManager.getCustomWordSets())
  const [isCreating, setIsCreating] = useState(false)
  const [newSetName, setNewSetName] = useState("")
  const [newWords, setNewWords] = useState("")
  const [validationResult, setValidationResult] = useState<{ valid: string[]; invalid: string[] } | null>(null)

  const handleCreateSet = () => {
    if (!newSetName.trim() || !newWords.trim()) return

    const wordsArray = newWords
      .split("\n")
      .map((w) => w.trim())
      .filter((w) => w.length > 0)
    const validation = wordManager.validateCustomWords(wordsArray)

    if (validation.invalid.length > 0) {
      setValidationResult(validation)
      return
    }

    const setId = wordManager.addCustomWordSet(newSetName.trim(), validation.valid, "Host")
    const updatedSets = wordManager.getCustomWordSets()
    setCustomSets(updatedSets)

    // Reset form
    setNewSetName("")
    setNewWords("")
    setValidationResult(null)
    setIsCreating(false)
    onWordsUpdated?.()
  }

  const handleDeleteSet = (id: string) => {
    if (wordManager.removeCustomWordSet(id)) {
      const updatedSets = wordManager.getCustomWordSets()
      setCustomSets(updatedSets)
      onWordsUpdated?.()
    }
  }

  const handleValidateWords = () => {
    if (!newWords.trim()) return

    const wordsArray = newWords
      .split("\n")
      .map((w) => w.trim())
      .filter((w) => w.length > 0)
    const validation = wordManager.validateCustomWords(wordsArray)
    setValidationResult(validation)
  }

  if (!isHost) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Custom Words
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Only the room host can manage custom words.</p>
          {customSets.length > 0 && (
            <div className="mt-4 space-y-2">
              <Label>Active Custom Word Sets:</Label>
              {customSets.map((set) => (
                <Badge key={set.id} variant="secondary">
                  {set.name} ({set.words.length} words)
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Custom Words Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Custom Sets */}
        {customSets.length > 0 && (
          <div className="space-y-2">
            <Label>Your Custom Word Sets:</Label>
            {customSets.map((set) => (
              <div key={set.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{set.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {set.words.length} words • Created {new Date(set.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {set.words.slice(0, 5).map((word, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {word}
                      </Badge>
                    ))}
                    {set.words.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{set.words.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSet(set.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Create New Set */}
        {!isCreating ? (
          <Button onClick={() => setIsCreating(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Word Set
          </Button>
        ) : (
          <div className="space-y-4 p-4 border rounded-lg">
            <div>
              <Label htmlFor="setName">Word Set Name</Label>
              <Input
                id="setName"
                value={newSetName}
                onChange={(e) => setNewSetName(e.target.value)}
                placeholder="e.g., Movie Titles, Brand Names"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="words">Words (one per line)</Label>
              <Textarea
                id="words"
                value={newWords}
                onChange={(e) => setNewWords(e.target.value)}
                placeholder="BATMAN&#10;SUPERMAN&#10;SPIDERMAN&#10;WONDER WOMAN"
                className="mt-1 h-32"
              />
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={handleValidateWords}>
                  <Check className="w-4 h-4 mr-1" />
                  Validate Words
                </Button>
                <p className="text-xs text-muted-foreground flex items-center">
                  Words should be 2-30 characters, letters only
                </p>
              </div>
            </div>

            {/* Validation Results */}
            {validationResult && (
              <div className="space-y-2">
                {validationResult.valid.length > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 font-medium">
                      <Check className="w-4 h-4" />
                      Valid Words ({validationResult.valid.length})
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {validationResult.valid.map((word, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {word}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {validationResult.invalid.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      Invalid Words ({validationResult.invalid.length})
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {validationResult.invalid.map((word, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {word}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleCreateSet}
                disabled={!newSetName.trim() || !newWords.trim() || (validationResult?.invalid.length ?? 0) > 0}
              >
                Create Word Set
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false)
                  setNewSetName("")
                  setNewWords("")
                  setValidationResult(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
