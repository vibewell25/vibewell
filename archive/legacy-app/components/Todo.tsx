import React, { useState } from 'react';
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useAccessibilityContext } from "@/contexts/AccessibilityContext";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
interface TodoProps {
  title?: string;
  className?: string;
export function Todo({ title = "Todo List", className }: TodoProps) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const { highContrast, fontSize } = useAccessibilityContext();

  const addTodo = () => {
    if (newTodo.trim() === "") return;
    
    const todo: TodoItem = {
      id: Math.random().toString(36).substring(2, 9),
      text: newTodo,
      completed: false
setTodos([...todos, todo]);
    setNewTodo("");
const toggleTodo = (id: string) => {
    setTodos(
      todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
// Apply font size to text based on accessibility context
  const getFontSize = () => {
    switch (fontSize) {
      case 'small': return 'text-sm';
      case 'medium': return 'text-base';
      case 'large': return 'text-lg';
      case 'xl': return 'text-xl';
      default: return 'text-base';
return (
    <Card className={cn(
      "w-full max-w-md mx-auto p-4", 
      highContrast ? "border-2 border-black dark:border-white" : "",
      className
    )}>
      <h2 className={cn(
        "font-semibold mb-4", 
        getFontSize() === 'text-sm' ? 'text-base' : 
        getFontSize() === 'text-base' ? 'text-lg' : 
        getFontSize() === 'text-lg' ? 'text-xl' : 'text-2xl',
        highContrast ? "text-black dark:text-white" : ""
      )}>
        {title}
      </h2>
      
      <div className="flex gap-2 mb-4">
        <Input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new task"
          className={cn(
            "flex-1",
            highContrast ? "border-2 border-black dark:border-white placeholder:text-gray-700 dark:placeholder:text-gray-300" : ""
          )}
          aria-label="New task input"
        />
        <Button 
          onClick={addTodo} 
          className={highContrast ? "border-2 border-black dark:border-white" : ""}
        >
          Add
        </Button>
      </div>
      
      <div className="space-y-2">
        {todos.length === 0 ? (
          <p className={cn(
            "text-center py-2",
            getFontSize(),
            highContrast ? "text-black dark:text-white" : "text-muted-foreground"
          )}>
            No tasks yet. Add some above!
          </p>
        ) : (
          todos.map(todo => (
            <div 
              key={todo.id} 
              className={cn(
                "flex items-center justify-between p-2 rounded border",
                todo.completed ? 
                  highContrast ? "bg-gray-200 dark:bg-gray-800" : "bg-muted/50" : "",
                highContrast ? "border-2 border-black dark:border-white" : ""
              )}
            >
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodo(todo.id)}
                  id={`todo-${todo.id}`}
                  className={highContrast ? "border-2 border-black dark:border-white" : ""}
                  aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
                />
                <label 
                  htmlFor={`todo-${todo.id}`}
                  className={cn(
                    "cursor-pointer",
                    getFontSize(),
                    todo.completed ? "line-through" : "",
                    todo.completed && !highContrast ? "text-muted-foreground" : "",
                    highContrast ? "text-black dark:text-white" : ""
                  )}
                >
                  {todo.text}
                </label>
              </div>
              <Button 
                variant={highContrast ? "default" : "ghost"}
                size="icon" 
                onClick={() => deleteTodo(todo.id)}
                className={cn(
                  "h-7 w-7",
                  highContrast ? "border-2 border-black dark:border-white" : ""
                )}
                aria-label={`Delete task "${todo.text}"`}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
