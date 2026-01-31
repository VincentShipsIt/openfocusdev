'use client';

import { useParams } from 'next/navigation';
import { redirect } from 'next/navigation';

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  redirect(`/projects/${projectId}/list`);
}
