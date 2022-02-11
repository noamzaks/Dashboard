import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import GridLayout from "react-grid-layout";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

interface DashboardWidget {
    name: string;
    type: string;
    x: number;
    y: number;
    w: number;
    h: number;
    static: boolean;
    attributes: string;
}

interface DashboardTab {
    name: string;
    columns: number;
    widgets: DashboardWidget[];
}

interface DashboardSchema {
    tabs: DashboardTab[];
}

const App = () => {
    const [schema, setSchema] = useState<DashboardSchema>({
        tabs: [],
    });

    useEffect(() => {
        // @ts-ignore
        window.setSchema = (schema: string) => setSchema(JSON.parse(schema));
        // @ts-ignore
        window.getSchema = () => JSON.stringify(schema, null, 4);
    });

    return (
        <Tabs>
            <TabList>
                {schema.tabs.map((tab) => (
                    <Tab key={tab.name}>{tab.name}</Tab>
                ))}
            </TabList>

            {schema.tabs.map((tab) => (
                <TabPanel>
                    <GridLayout cols={tab.columns} rowHeight={116} width={1600}>
                        {tab.widgets.map((widget) => {
                            return (
                                <div
                                    key={widget.name}
                                    style={{
                                        height: "100%",
                                        width: "100%",
                                        borderColor: "black",
                                        borderWidth: 2,
                                        borderRadius: 10,
                                        borderStyle: "solid",
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                    data-grid={widget}
                                >
                                    <h3
                                        style={{
                                            textAlign: "center",
                                            margin: 5,
                                        }}
                                    >
                                        {widget.name}
                                    </h3>
                                    <hr />
                                    <div
                                        style={{
                                            display: "flex",
                                            flexGrow: 1,
                                        }}
                                    >
                                        <div
                                            style={{ margin: "auto" }}
                                            dangerouslySetInnerHTML={{
                                                __html: `<${widget.type} ${widget.attributes} style="max-width: 100%; max-height: 100%;"></${widget.type}>`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </GridLayout>
                </TabPanel>
            ))}
        </Tabs>
    );
};

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
);
