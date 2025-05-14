import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import invariant from "tiny-invariant";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  getAccessLevelToTask,
  getTask,
  getTaskAccessUsers,
  removeTaskAccess,
  shareTaskWithUser,
} from "~/models/task.server";
import { searchUsersByEmail } from "~/models/user.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.taskId, "taskId not found");
  const taskId = params.taskId;
  const accessLevel = await getAccessLevelToTask(taskId, userId);

  if (accessLevel === "viewer") {
    throw new Response("You don't have permission to share this task", {
      status: 403,
    });
  }

  const task = await getTask({ id: taskId, userId });
  if (!task) {
    throw new Response("Not Found", { status: 404 });
  }

  // Get users who already have access to the task
  const accessUsers = await getTaskAccessUsers({ taskId, userId });

  return json({ task, accessUsers });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const taskId = params.taskId as string;
  const action = formData.get("_action");

  // Handle different actions
  if (action === "search_users") {
    const searchTerm = formData.get("searchTerm") as string;
    const users = await searchUsersByEmail(searchTerm, userId);
    return json({ users });
  } else if (action === "share_task") {
    const targetUserId = formData.get("userId") as string;
    const accessLevel = (formData.get("accessLevel") as string) || "viewer";

    try {
      await shareTaskWithUser({
        taskId,
        ownerId: userId,
        targetUserId,
        accessLevel,
      });
      return json({ success: true, action: "share" });
    } catch {
      return json(
        { error: "An error occurred when sharing the task" },
        { status: 400 },
      );
    }
  } else if (action === "remove_access") {
    const targetUserId = formData.get("userId") as string;

    try {
      await removeTaskAccess({
        taskId,
        ownerId: userId,
        targetUserId,
      });
      return json({ success: true, action: "remove" });
    } catch {
      return json(
        { error: "An error occurred when removing access" },
        { status: 400 },
      );
    }
  }

  return null;
};

// Define explicit types for action data
type ActionData =
  | { users: { id: string; email: string }[] }
  | { success: true; action: "share" | "remove" }
  | { error: string }
  | null;

export default function ShareTaskPage() {
  const { task, accessUsers } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [accessLevel, setAccessLevel] = useState("viewer");
  const [searchResults, setSearchResults] = useState<
    { id: string; email: string }[]
  >([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Handle successful actions
  useEffect(() => {
    if (actionData && "success" in actionData && actionData.success) {
      if (actionData.action === "share") {
        toast.success("Task shared successfully");
        setSelectedUser(null);
        setSearchTerm("");
        formRef.current?.reset();
      } else if (actionData.action === "remove") {
        toast.success("Access removed successfully");
      }
    }
  }, [actionData]);

  // Update search results when they come back from the server
  useEffect(() => {
    if (actionData && "users" in actionData) {
      setSearchResults(actionData.users);
      setHasSearched(true);
    }
  }, [actionData]);

  const handleUserSelect = (user: { id: string; email: string }) => {
    setSelectedUser(user);
    setSearchResults([]);
    setSearchTerm(user.email);
    setHasSearched(false);
  };

  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="mx-auto max-w-xl">
      <h2 className="text-2xl font-bold">Share Task: {task.title}</h2>

      {/* Search for users */}
      <div className="mt-6">
        <h3 className="mb-2 text-lg font-semibold">Share with a user</h3>
        <Form method="post" ref={formRef}>
          <input type="hidden" name="_action" value="search_users" />
          <div className="flex gap-2">
            <Input
              name="searchTerm"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!searchTerm || isSubmitting}>
              Search
            </Button>
          </div>
        </Form>

        {/* Show search results */}
        {searchResults.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-md border">
            <ul>
              {searchResults.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    className="w-full p-2 text-left hover:bg-gray-100"
                    onClick={() => handleUserSelect(user)}
                  >
                    {user.email}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : hasSearched ? (
          <div className="mt-4 p-3 text-center text-gray-500 border border-gray-200 rounded-md">
            No users found matching your search.
          </div>
        ) : null}

        {/* Share form */}
        {selectedUser ? (
          <Form method="post" className="mt-4 rounded-md border p-4">
            <input type="hidden" name="_action" value="share_task" />
            <input type="hidden" name="userId" value={selectedUser.id} />

            <div className="mb-4">
              <p>
                Share with: <strong>{selectedUser.email}</strong>
              </p>
            </div>

            <div className="mb-4">
              <Label>Access Level</Label>
              <RadioGroup
                name="accessLevel"
                value={accessLevel}
                onValueChange={setAccessLevel}
                className="mt-2 flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="viewer" id="viewer" />
                  <Label htmlFor="viewer">Viewer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="editor" id="editor" />
                  <Label htmlFor="editor">Editor</Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sharing..." : "Share Task"}
            </Button>
          </Form>
        ) : null}
      </div>

      {/* List of users who already have access */}
      <div className="mt-8">
        <h3 className="mb-2 text-lg font-semibold">Users with access</h3>

        {accessUsers.length === 0 ? (
          <p className="text-gray-500">
            No users have access to this task yet.
          </p>
        ) : (
          <ul className="divide-y rounded-md border">
            {accessUsers.map((access) => (
              <li
                key={access.id}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <p>{access.user.email}</p>
                  <p className="text-sm capitalize text-gray-500">
                    Access Level: {access.accessLevel}
                  </p>
                </div>
                <Form method="post">
                  <input type="hidden" name="_action" value="remove_access" />
                  <input type="hidden" name="userId" value={access.user.id} />
                  <Button
                    variant="destructive"
                    size="sm"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Remove
                  </Button>
                </Form>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Error message */}
      {actionData && "error" in actionData ? (
        <div className="mt-4 rounded bg-red-100 p-2 text-red-700">
          {actionData.error}
        </div>
      ) : null}
    </div>
  );
}
