-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Memories: users can CRUD own, read public
CREATE POLICY "Users can CRUD own memories" ON public.memories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public memories are viewable" ON public.memories FOR SELECT USING (is_public = true);

-- Mood entries: users can CRUD own
CREATE POLICY "Users can CRUD own mood entries" ON public.mood_entries FOR ALL USING (auth.uid() = user_id);

-- Chat messages: users can CRUD own
CREATE POLICY "Users can CRUD own chat messages" ON public.chat_messages FOR ALL USING (auth.uid() = user_id);

-- Achievements: users can read own
CREATE POLICY "Users can view own achievements" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert achievements" ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
