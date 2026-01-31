'use client';

import { redirect, useParams } from 'next/navigation';

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  redirect(`/projects/${projectId}/list`);
}
