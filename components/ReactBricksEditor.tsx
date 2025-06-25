"use client";

import { ReactBricks, Admin } from 'react-bricks';
import config from '../react-bricks.config';

interface ReactBricksEditorProps {
  pageType: string;
}

export default function ReactBricksEditor({ pageType }: ReactBricksEditorProps) {
  return (
    <ReactBricks
      appId={config.appId}
      apiKey={config.apiKey}
      pageTypes={config.pageTypes}
      blockTypes={config.blockTypes}
    >
      <Admin
        pageType={pageType}
        showSidebar={true}
        readOnly={false}
      />
    </ReactBricks>
  );
} 