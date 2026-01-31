import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { PrivacyControls } from '@/components/settings/PrivacyControls';
import { DataExport } from '@/components/settings/DataExport';
import { AccountSettings } from '@/components/settings/AccountSettings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default async function SettingsPage(): Promise<JSX.Element> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });

  if (!dbUser) {
    return <div>User not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Privacy Controls</CardTitle>
          <CardDescription>
            Control how your data is used for AI features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PrivacyControls user={dbUser} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
          <CardDescription>
            Download all your journal data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataExport userId={dbUser.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccountSettings user={dbUser} />
        </CardContent>
      </Card>
    </div>
  );
}
