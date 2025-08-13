import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, MessageCircle, Users, Circle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: 'admin' | 'partner';
}

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender: ChatUser;
}

interface ChatSystemProps {
  className?: string;
}

export function ChatSystem({ className }: ChatSystemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get available chat users - both partners and admins can see each other
  const { data: chatUsers = [] } = useQuery<ChatUser[]>({
    queryKey: ['/api/chat/users'],
    enabled: !!user,
  });

  // Get unread message counts
  const { data: unreadCounts = {} } = useQuery<Record<string, number>>({
    queryKey: ['/api/chat/unread-counts'],
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get chat messages for selected user
  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/messages', selectedUser?.id],
    enabled: !!user && !!selectedUser,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (newMessage: { receiverId: string; message: string }) => {
      return apiRequest('/api/chat/send', {
        method: 'POST',
        body: JSON.stringify(newMessage),
      });
    },
    onSuccess: () => {
      setMessage("");
      // Refresh messages
      queryClient.invalidateQueries({
        queryKey: ['/api/chat/messages', selectedUser?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/chat/unread-counts'],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (senderId: string) => {
      return apiRequest(`/api/chat/mark-read/${senderId}`, {
        method: 'PUT',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/chat/unread-counts'],
      });
    },
  });

  // WebSocket connection
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', userId: user.id }));
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'new_message') {
        // Refresh messages if it's for the selected user
        if (data.message.senderId === selectedUser?.id) {
          queryClient.invalidateQueries({
            queryKey: ['/api/chat/messages', selectedUser.id],
          });
        }
        
        // Refresh unread counts
        queryClient.invalidateQueries({
          queryKey: ['/api/chat/unread-counts'],
        });
        
        // Show toast notification
        toast({
          title: "New Message",
          description: `From ${data.message.sender?.firstName || data.message.sender?.email}`,
        });
      }
      
      if (data.type === 'user_online') {
        setOnlineUsers(prev => new Set(prev).add(data.userId));
      }
      
      if (data.type === 'user_offline') {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    };

    ws.onclose = () => {
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [user, selectedUser, queryClient, toast]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when selecting a user
  useEffect(() => {
    if (selectedUser && unreadCounts[selectedUser.id] > 0) {
      markAsReadMutation.mutate(selectedUser.id);
    }
  }, [selectedUser, unreadCounts]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedUser || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      receiverId: selectedUser.id,
      message: message.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    }
  };

  const getUserDisplayName = (user: ChatUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email.split('@')[0];
  };

  const getUserInitials = (user: ChatUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Please log in to access chat</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-[600px] flex flex-col ${className}`} data-testid="chat-system">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Chat System
        </CardTitle>
        <CardDescription>
          Real-time communication with {user.role === 'admin' ? 'partners' : 'administrators'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex gap-4 p-4 min-h-0">
        {/* Users List */}
        <div className="w-1/3 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Available Users</span>
          </div>
          
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {chatUsers.map((chatUser) => (
                <div
                  key={chatUser.id}
                  onClick={() => setSelectedUser(chatUser)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUser?.id === chatUser.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50'
                  }`}
                  data-testid={`user-${chatUser.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={chatUser.profileImageUrl} />
                        <AvatarFallback className="text-xs">
                          {getUserInitials(chatUser)}
                        </AvatarFallback>
                      </Avatar>
                      {onlineUsers.has(chatUser.id) && (
                        <Circle className="absolute -bottom-1 -right-1 h-3 w-3 fill-green-500 text-green-500" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">
                          {getUserDisplayName(chatUser)}
                        </p>
                        {unreadCounts[chatUser.id] > 0 && (
                          <Badge variant="destructive" className="text-xs px-1 py-0 min-w-[1.25rem] h-5">
                            {unreadCounts[chatUser.id]}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">
                        {chatUser.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator orientation="vertical" />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 pb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedUser.profileImageUrl} />
                  <AvatarFallback className="text-xs">
                    {getUserInitials(selectedUser)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{getUserDisplayName(selectedUser)}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {onlineUsers.has(selectedUser.id) ? (
                      <>
                        <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                        Online
                      </>
                    ) : (
                      <>
                        <Circle className="h-2 w-2 fill-gray-400 text-gray-400" />
                        Offline
                      </>
                    )}
                  </p>
                </div>
              </div>

              <Separator className="mb-3" />

              {/* Messages */}
              <ScrollArea className="flex-1 mb-3">
                <div className="space-y-3 pr-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          msg.senderId === user.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                        data-testid={`message-${msg.id}`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatMessageTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={sendMessageMutation.isPending}
                  data-testid="input-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  size="icon"
                  data-testid="button-send"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select a user to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}