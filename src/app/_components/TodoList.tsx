"use client";
import { trpc } from "../_trpc/client";
import { useState } from "react";
import { serverClient } from "../_trpc/serverClient";

interface TodoListProps {
  initialTodos: Awaited<ReturnType<(typeof serverClient)["getTodos"]>>;
}

export default function TodoList({ initialTodos }: TodoListProps) {
  const getTodos = trpc.getTodos.useQuery(undefined, {
    initialData: initialTodos,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  const addTodo = trpc.addTodo.useMutation({
    onSettled: () => {
      getTodos.refetch();
    },
  });
  const setDone = trpc.setDone.useMutation({
    onSettled: () => {
      getTodos.refetch();
    },
  });

  const [content, setContent] = useState("");
  return (
    <div>
      <div>
        {getTodos.data?.map((todo) => (
          <div key={todo.id}>
            <input
              id={`check-${todo.id}`}
              type="checkbox"
              checked={!!todo.done}
              style={{ zoom: 1.5 }}
              onChange={async () => {
                setDone.mutate({
                  id: todo.id,
                  done: todo.done ? 0 : 1,
                });
              }}
            />
            <label htmlFor={`check-${todo.id}`}>{todo.content}</label>
          </div>
        ))}
      </div>
      <div>
        <label htmlFor="content">Content</label>
        <input
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="text-black"
        />
        <button
          onClick={async () => {
            if (content.length) {
              addTodo.mutate(content);
              setContent("");
            }
          }}
        >
          Add todo
        </button>
      </div>
    </div>
  );
}
