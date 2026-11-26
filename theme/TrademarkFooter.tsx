import { usePageData } from '@rspress/core/runtime';

import './trademark-footer.css';

/**
 * The Apache Software Foundation trademark statement, rendered as a site footer.
 *
 * The compliance guide requires the statement on every page of the user
 * documentation that shows the mark, and accepts it being written once in a
 * footer rendered on each page; a separate trademarks page does not count. It
 * has to be reproduced whole, so both paragraphs are kept verbatim -- do not
 * reword, abbreviate, or drop the registered-trademark signs. ASF also asks for
 * links to the project home page and to apache.org beside the statement, and,
 * because this is a modified build, a channel for reporting its bugs and
 * security issues.
 *
 * The same paragraphs also appear in `docs/en/intro.mdx` and in the
 * `llmstxt-config.yaml` body; keep the three copies identical.
 */
export const TrademarkFooter = () => {
  const { page } = usePageData();
  // Doc pages reserve the left gutter for the fixed sidebar; other page types
  // (home, 404) span the full width.
  const inset = page.pageType === 'doc' ? ' doom-trademark-footer--inset' : '';
  return (
    <footer className={`doom-trademark-footer${inset}`}>
      <p>
        Apache®, Apache Kafka®, and the Apache Kafka logo are either registered trademarks or
        trademarks of The Apache Software Foundation in the United States and/or other countries.
      </p>
      <p>
        Apache®, Apache ZooKeeper™, and the Apache ZooKeeper logo are either registered trademarks
        or trademarks of The Apache Software Foundation in the United States and/or other countries.
      </p>
      <p>
        Alauda is an independent vendor. This product is not affiliated with, endorsed by, or
        sponsored by The Apache Software Foundation. All trademarks are the property of their
        respective owners and are used here for identification purposes only.
      </p>
      <p>
        Apache Kafka project: <a href="https://kafka.apache.org/">https://kafka.apache.org/</a>
        {' · '}
        The Apache Software Foundation: <a href="https://www.apache.org/">https://www.apache.org/</a>
      </p>
      <p>
        Report bugs and security issues: <a href="https://cloud.alauda.io/errata">https://cloud.alauda.io/errata</a>
      </p>
    </footer>
  );
};
