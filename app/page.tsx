"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Send,
  Plus,
  Search,
  MoreVertical,
  Mic,
  Laugh,
  Quote,
  Calculator,
  HelpCircle,
  Trash2,
  Info,
  Code,
  Share2,
} from "lucide-react"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

interface Command {
  command: string
  response: string | (() => string)
  icon: React.ReactNode
  label: string
}

export default function DianAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello there! 👋 I'm Dian AI, your intelligent assistant. You can ask me anything naturally or use commands like /help to get started. 😊",
      isUser: false,
      timestamp: new Date(),
    },
    {
      id: "2",
      text: "Tip: Click the ⋯ icon to connect with me on social media!",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showCommands, setShowCommands] = useState(false)
  const [showSocialModal, setShowSocialModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const PRIVATE_API_ENDPOINT = "https://api.giftedtech.my.id/api/ai/openai"
  const JOKE_API_ENDPOINT = "https://api.giftedtech.my.id/api/fun/jokes"
  const YOUR_API_KEY = "gifted"

  const commands: Command[] = [
    { command: "joke", response: "", icon: <Laugh className="w-4 h-4" />, label: "Joke" },
    {
      command: "quote",
      response: '"The only way to do great work is to love what you do." — Steve Jobs 💡',
      icon: <Quote className="w-4 h-4" />,
      label: "Quote",
    },
    { command: "calculate", response: "", icon: <Calculator className="w-4 h-4" />, label: "Calculate" },
    {
      command: "help",
      response:
        "Available commands: /about, /dev, /joke, /quote, /calculate, /clear, /socials, /info, /update, /ping, /uptime, /evaluate 📚",
      icon: <HelpCircle className="w-4 h-4" />,
      label: "Help",
    },
    { command: "clear", response: "", icon: <Trash2 className="w-4 h-4" />, label: "Clear" },
    {
      command: "about",
      response:
        "Dian AI 1.0 is a versatile chatbot with built-in commands and integrated APIs, designed to assist you efficiently. 🤖✨",
      icon: <Info className="w-4 h-4" />,
      label: "About",
    },
    {
      command: "dev",
      response:
        "Created by Dian 🤝 and the talented H.A.P.E class team 🎓💻. We're passionate about building innovative solutions! 🚀",
      icon: <Code className="w-4 h-4" />,
      label: "Developers",
    },
    {
      command: "socials",
      response: "Connect with me on WhatsApp, TikTok, Instagram, and Twitter/X! 📱",
      icon: <Share2 className="w-4 h-4" />,
      label: "Socials",
    },
  ]

  const socialPlatforms = [
    { name: "WhatsApp", icon: "📱", color: "bg-green-500", description: "Chat with me directly" },
    { name: "TikTok", icon: "🎵", color: "bg-black", description: "Watch my latest videos" },
    {
      name: "Instagram",
      icon: "📸",
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      description: "Follow for updates",
    },
    { name: "Twitter/X", icon: "🐦", color: "bg-blue-500", description: "Join the conversation" },
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    const timer = setTimeout(() => {
      addBotMessage("Tap the + button for quick access to commands like /joke and /quote! 🚀")
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const addBotMessage = (text: string) => {
    addMessage(text, false)
  }

  const showTypingIndicator = () => {
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 1500)
  }

  const safeCalculate = (expression: string): number => {
    if (!/^[0-9+\-*/.\s()]+$/.test(expression)) {
      throw new Error("Invalid characters. Only numbers and basic operators allowed.")
    }
    try {
      return new Function("return " + expression)()
    } catch (e) {
      throw new Error("Could not evaluate expression. Please check syntax.")
    }
  }

  const fetchJoke = async () => {
    showTypingIndicator()
    try {
      const url = `${JOKE_API_ENDPOINT}?apikey=${YOUR_API_KEY}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Error: ${response.status}`)

      const data = await response.json()
      let jokeText = "Why don't scientists trust atoms? Because they make up everything! 😄"

      if (typeof data.result === "string") {
        jokeText = data.result
      } else if (typeof data.result === "object" && data.result !== null) {
        if (data.result.joke) {
          jokeText = data.result.joke
        } else if (data.result.setup && data.result.punchline) {
          jokeText = `${data.result.setup} — ${data.result.punchline}`
        }
      }

      setTimeout(() => addBotMessage(jokeText + " 😂"), 1500)
    } catch (error) {
      setTimeout(
        () =>
          addBotMessage(
            "Why don't skeletons fight each other? They don't have the guts! 😅 (I couldn't fetch a joke right now)",
          ),
        1500,
      )
    }
  }

  const queryAI = async (question: string) => {
    showTypingIndicator()
    try {
      const encodedQuery = encodeURIComponent(question)
      const url = `${PRIVATE_API_ENDPOINT}?apikey=${YOUR_API_KEY}&q=${encodedQuery}`
      const response = await fetch(url)

      if (!response.ok) throw new Error(`Error: ${response.status}`)

      const data = await response.json()
      let botAnswer = "I couldn't process your request. Please try a different question."

      if (data.result !== undefined && data.result !== null) {
        botAnswer = typeof data.result === "object" ? JSON.stringify(data.result) : data.result
      }

      setTimeout(() => addBotMessage(botAnswer), 1500)
    } catch (error) {
      setTimeout(() => addBotMessage("I'm having trouble connecting right now. Please try again later. 😔"), 1500)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    addMessage(inputValue, true)
    const userInputValue = inputValue.trim()
    const lowerCaseInput = userInputValue.toLowerCase()
    setInputValue("")

    // Handle commands
    if (lowerCaseInput === "/joke") {
      await fetchJoke()
      return
    } else if (lowerCaseInput.startsWith("/calculate")) {
      try {
        const calculation = userInputValue.replace("/calculate", "").trim()
        const result = safeCalculate(calculation)
        addBotMessage(`Result: ${result} 📊`)
      } catch (error) {
        addBotMessage(`Error: ${(error as Error).message} 🤔`)
      }
      return
    } else if (lowerCaseInput === "/clear") {
      setMessages([])
      addBotMessage("Chat history cleared! 🗑️ How can I assist you now?")
      return
    } else if (lowerCaseInput.startsWith("/ai")) {
      const aiQuery = userInputValue.substring(3).trim()
      if (!aiQuery) {
        addBotMessage("Please ask a question after /ai. For example: /ai What is artificial intelligence?")
        return
      }
      await queryAI(aiQuery)
      return
    }

    // Check for matching commands
    let commandFound = false
    for (const cmd of commands) {
      if (lowerCaseInput === `/${cmd.command}` || lowerCaseInput === cmd.command) {
        commandFound = true
        if (typeof cmd.response === "function") {
          addBotMessage(cmd.response())
        } else if (cmd.response) {
          addBotMessage(cmd.response)
        }
        break
      }
    }

    if (!commandFound) {
      await queryAI(userInputValue)
    }
  }

  const handleCommandClick = (command: string) => {
    setInputValue(`/${command}`)
    setShowCommands(false)
    setTimeout(() => handleSendMessage(), 100)
  }

  const handleSocialClick = (platform: string) => {
    addBotMessage(`Taking you to my ${platform} profile...`)
    setShowSocialModal(false)
    setTimeout(() => {
      addBotMessage(`Here's the link to my ${platform}: https://${platform.toLowerCase()}.com/dian-ai`)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md h-[90vh] max-h-[800px] flex flex-col overflow-hidden shadow-2xl border-0 bg-gradient-to-b from-slate-50 to-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 flex items-center gap-3 shadow-lg">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-lg shadow-md">
            D
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Dian AI</h1>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Online • Responds instantly
            </div>
          </div>
          <div className="flex gap-4 text-xl">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Search className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setShowSocialModal(true)}
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50/50 to-white/80">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
                  message.isUser
                    ? "bg-emerald-500 text-white rounded-br-sm"
                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Command Menu */}
        {showCommands && (
          <div className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-10">
            <div className="grid grid-cols-2 gap-2">
              {commands.map((cmd) => (
                <Button
                  key={cmd.command}
                  variant="ghost"
                  size="sm"
                  className="justify-start gap-2 h-auto p-3 hover:bg-slate-100"
                  onClick={() => handleCommandClick(cmd.command)}
                >
                  {cmd.icon}
                  <span className="text-xs">{cmd.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-emerald-600 hover:bg-emerald-50"
              onClick={() => setShowCommands(!showCommands)}
            >
              <Plus className="w-5 h-5" />
            </Button>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
            <Button variant="ghost" size="icon" className="text-emerald-600 hover:bg-emerald-50">
              <Mic className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleSendMessage}
              size="icon"
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-3 text-xs text-slate-500 bg-slate-50 border-t border-slate-200">
          Crafted with ❤️ by <span className="font-medium text-emerald-600">Dian</span>
        </div>
      </Card>

      {/* Social Media Modal */}
      <Dialog open={showSocialModal} onOpenChange={setShowSocialModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold text-slate-800">Connect With Me</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 p-4">
            {socialPlatforms.map((platform) => (
              <Card
                key={platform.name}
                className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                onClick={() => handleSocialClick(platform.name)}
              >
                <CardContent className="p-4 text-center">
                  <div
                    className={`w-16 h-16 rounded-full ${platform.color} flex items-center justify-center text-2xl mx-auto mb-3 shadow-md`}
                  >
                    {platform.icon}
                  </div>
                  <h3 className="font-medium text-slate-800 mb-1">{platform.name}</h3>
                  <p className="text-xs text-slate-500">{platform.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
