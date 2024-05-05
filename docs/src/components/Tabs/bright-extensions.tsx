import type { BrightProps, Extension } from "bright";
import { Code } from "bright";

import { TabsContent, TabsList, TabsRoot } from "./components.js";

const TitleBarComponent: BrightProps["TitleBarContent"] = (brightProps) => {
  const { subProps, title, Tab } = brightProps;
  const titles = subProps?.length
    ? subProps.map((subProp) => subProp.title)
    : [title];
  const childProps = subProps?.length ? subProps : [brightProps];
  return (
    <TabsList titles={titles}>
      {titles.map((title, i) => (
        <Tab key={title} {...(childProps[i] as any)} />
      ))}
    </TabsList>
  );
};

const Root: BrightProps["Root"] = (brightProps) => {
  const { subProps, title, ...rest } = brightProps;

  const titles = subProps?.length
    ? subProps.map((subProp) => subProp.title)
    : [title];

  return (
    <TabsRoot
      initialValue={{
        value: titles[0],
      }}
    >
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted code
        dangerouslySetInnerHTML={{
          __html: `
        [data-tab-state="false"] {
          --tab-background: var(--inactive-tab-background);
          --tab-color: var(--inactive-tab-color);
          --tab-bottom-border: transparent;
          --tab-top-border: transparent;
        }
      `,
        }}
      />
      {Code.Root && <Code.Root subProps={subProps} title={title} {...rest} />}
    </TabsRoot>
  );
};

const Content: BrightProps["Pre"] = (brightProps) => {
  const { subProps } = brightProps;
  const propsList = subProps?.length ? subProps : [brightProps];
  return (
    <>
      {propsList.map((props) => (
        <TabsContent key={props.title} value={props.title}>
          {Code.Pre && <Code.Pre {...(props as any)} />}
        </TabsContent>
      ))}
    </>
  );
};

export const tabs: Extension = {
  name: "tabs",
  Root,
  TitleBarContent: TitleBarComponent,
  Pre: Content,
};
