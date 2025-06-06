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

import { PageTitle } from "~/components/page-title";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { checkRateLimit } from "~/lib/rate-limiter";
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

  if (accessLevel === "viewer" || accessLevel === "editor") {
    throw new Response("Not Found", { status: 404 });
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
  const rateLimitResponse = await checkRateLimit(request);
  if (rateLimitResponse) throw rateLimitResponse;

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
    <div className="flex flex-col gap-6">
      <PageTitle
        title={`Share Task: ${task.title}`}
        backButton
        taskId={task.id}
      />
      <div className="flex w-full flex-row items-start gap-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Share with a user</CardTitle>
            <CardDescription>
              Search for an existing user and share your task with them.
            </CardDescription>
          </CardHeader>
          <CardContent>
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

            {searchResults.length > 0 ? (
              <div className="mt-4 overflow-hidden">
                <ul className="flex flex-col gap-2">
                  {searchResults.map((user) => (
                    <li key={user.id}>
                      <Button
                        variant={"outline"}
                        className="w-full"
                        onClick={() => handleUserSelect(user)}
                      >
                        {user.email}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : hasSearched ? (
              <div className="mt-4 rounded-md border border-gray-200 p-3 text-center text-sm text-gray-500">
                No users found matching your search.
              </div>
            ) : null}

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
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Users with access</CardTitle>
            <CardDescription>
              These are the users that have access to this task.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {accessUsers.length === 0 ? (
              <p className="text-sm text-gray-500">
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
                      <input
                        type="hidden"
                        name="_action"
                        value="remove_access"
                      />
                      <input
                        type="hidden"
                        name="userId"
                        value={access.user.id}
                      />
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
          </CardContent>
        </Card>
      </div>

      {actionData && "error" in actionData ? (
        <div className="mt-4 rounded bg-red-100 p-2 text-red-700">
          {actionData.error}
        </div>
      ) : null}
    </div>
  );
}
