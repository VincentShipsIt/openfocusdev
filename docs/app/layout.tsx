import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata = {
  title: 'TaskFlow Documentation',
  description:
    'Open-source task management app — Todoist alternative with AI agents',
}

const navbar = (
  <Navbar
    logo={
      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
        📋 TaskFlow
      </span>
    }
    projectLink="https://github.com/shipshitdev/todo"
  />
)

const footer = (
  <Footer>
    © {new Date().getFullYear()}{' '}
    <a href="https://shipshit.dev" target="_blank" rel="noopener noreferrer">
      shipshit.dev
    </a>
    . MIT License.
  </Footer>
)

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          footer={footer}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/shipshitdev/todo/tree/main/docs"
          sidebar={{ defaultMenuCollapseLevel: 1, toggleButton: true }}
          toc={{ backToTop: true }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
