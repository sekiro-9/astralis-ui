import { Box, Flex } from "astralis-ui";
import { uiVersion } from "@/lib/ui-version";
import { PageNav } from "@/modules/site/page-nav";
import { Sidebar } from "@/modules/site/sidebar";
import { Toc } from "@/modules/site/toc";

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Flex mx="auto" maxW="96rem" px={{ base: "4", lg: "8" }}>
      <Box
        as="aside"
        position="sticky"
        top="3.5rem"
        display={{ base: "hidden", lg: "block" }}
        h="calc(100vh - 3.5rem)"
        w="60"
        shrink="0"
        overflowY="auto"
        borderR="normal"
        borderColor="base"
        py="8"
        pr="3"
        className="docs-scroll"
      >
        <Sidebar version={uiVersion} />
      </Box>

      <Box as="main" minW="0" flex="1" px={{ base: "0", lg: "12" }} py="10">
        <Box as="article" mx="auto" maxW="3xl">
          {children}
        </Box>
        <PageNav />
      </Box>

      <Box
        as="aside"
        position="sticky"
        top="3.5rem"
        display={{ base: "hidden", xl: "block" }}
        h="calc(100vh - 3.5rem)"
        w="56"
        shrink="0"
        overflowY="auto"
        py="10"
        className="docs-scroll"
      >
        <Toc />
      </Box>
    </Flex>
  );
}
