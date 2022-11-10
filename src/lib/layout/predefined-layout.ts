import {
    ComponentItemConfig,
    ItemType,
    LayoutConfig,
    StackItemConfig,
} from "golden-layout";

const TextureEditorLayoutConfig: LayoutConfig = {
    root: {
        type: ItemType.row,
        content: [
            {
                type: ItemType.column,
                content: [
                    {
                        type: ItemType.component,
                        title: "2D View",
                        header: { show: "top", popout: false },
                        componentType: "view2D",
                        componentState: undefined,
                    } as ComponentItemConfig,
                    {
                        type: ItemType.component,
                        title: "3D View",
                        header: { show: "top", popout: false },
                        componentType: "view3D",
                        componentState: undefined,
                    } as ComponentItemConfig,
                ],
            },
            {
                type: ItemType.component,
                title: "Editor",
                header: { show: "top", popout: false },
                componentType: "editorView",
                componentState: undefined,
            } as ComponentItemConfig,
            {
                type: ItemType.column,
                content: [
                    {
                        type: ItemType.component,
                        title: "Properties",
                        header: { show: "top", popout: false },
                        componentType: "propertyView",
                        componentState: undefined,
                    } as ComponentItemConfig,
                    {
                        type: ItemType.stack,
                        content: [
                            {
                                type: ItemType.component,
                                title: "Library",
                                header: { show: "top", popout: false },
                                componentType: "libraryView",
                                componentState: undefined,
                            } as ComponentItemConfig,
                            {
                                type: ItemType.component,
                                title: "Explorer",
                                header: { show: "top", popout: false },
                                componentType: "explorerView",
                                componentState: undefined,
                            } as ComponentItemConfig,
                        ],
                    },
                ],
            },
        ],
    },
};

export const predefinedLayout = {
    defaultLayout: TextureEditorLayoutConfig,
}