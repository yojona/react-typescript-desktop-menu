import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MenubarStyles, MenubarClassNames } from './shared';
import styles from './default-styles.module.css';
import useOnClickOutside from './use-on-click-outside';
import { MenuProps } from './menu';

export interface MenubarProps {
    children: React.ReactNode;
    action?: (tag: string, checked: boolean, event: React.MouseEvent<HTMLLIElement, MouseEvent>) => void;

    onSetOpen: (open: boolean) => void;
    isOpen: boolean;

    menubarStyles?: MenubarStyles;
    menubarClassNames?: MenubarClassNames;
}

const Menubar: React.FC<MenubarProps> = ({ children, action, onSetOpen, isOpen, menubarStyles, menubarClassNames }) => {
    const items: React.ReactNode[] = [];

    const [menuActive, setMenuActive] = useState(-1);

    const close = useCallback((): void => {
        setMenuActive(-1);
        onSetOpen && onSetOpen(false);
    }, [onSetOpen, setMenuActive]);

    const containerRef = useRef(null);

    const clickOutsideHandler = useCallback(() => {
        close();
    }, [close]);

    useOnClickOutside(containerRef, clickOutsideHandler);

    useEffect(() => {
        if (!isOpen) {
            setMenuActive(-1);
        }
    }, [isOpen]);

    const handleMouseDown = (): void => {
        onSetOpen && onSetOpen(true);
    };

    const handleMouseOver = (i: number): void => {
        if (i !== menuActive) {
            setMenuActive(i);
        }
    };

    const handleMouseOut = (): void => {
        if (!isOpen) {
            setMenuActive(-1);
        }
    };

    const handleKeyDown = useCallback(
        (e: KeyboardEvent): void => {
            switch (e.key) {
                case 'Escape':
                    close();
                    break;

                default:
                    break;
            }
        },
        [close],
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);

        return (): void => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const renderChildren = (): JSX.Element[] | null | undefined => {
        return React.Children.map<JSX.Element, React.ReactNode>(children, (child: React.ReactNode, index: number) => {
            // I know this looks a bit odd but functionally speaking it would never happen, there are just still
            // some holes in React's typescript awareness that this gets around
            if (!child || child === null) {
                return <React.Fragment />;
            } else if (!React.isValidElement(child)) {
                return <React.Fragment>{child}</React.Fragment>;
            }

            items[index] = child;

            const active = menuActive === index;

            const props: MenuProps = {
                display: isOpen && active,
                menuStyles: { ...menubarStyles?.menu, ...child.props.menuStyles },
                menuClassNames: { ...menubarClassNames?.menu, ...child.props.menuClassNames },
                action: child.props.action,
            };

            if (!('action' in child.props) || !child.props.action) {
                props.action = action;
            }

            const menu = React.cloneElement(child, props);

            let className =
                styles['react-menu-bar-menu-bar-item'] +
                ' react-menu-bar-menu-bar-item ' +
                (menubarClassNames?.listitem || '');

            let style = { ...menubarStyles?.listitem };

            if (active) {
                className +=
                    styles['react-menu-bar-menu-bar-item-active'] +
                    ' react-menu-bar-menu-bar-item-active ' +
                    (menubarClassNames?.activeListitem || '');

                style = { ...style, ...menubarStyles?.activeListitem };
            }

            return (
                <li
                    className={className}
                    style={style}
                    onMouseOver={(): void => handleMouseOver(index)}
                    tabIndex={index + 1}
                    data-ordinal={index}
                    key={`menu-bar-item-${index}`}
                >
                    {child.props.label}
                    <br />
                    {menu}
                </li>
            );
        });
    };

    return (
        <ul
            className={
                styles['react-menu-bar-menu-bar-container'] +
                ' react-menu-bar-menu-bar-container ' +
                (menubarClassNames?.unorderedlist || '')
            }
            style={{ ...menubarStyles?.unorderedlist }}
            onMouseDown={handleMouseDown}
            onMouseOut={handleMouseOut}
            ref={containerRef}
        >
            {renderChildren()}
        </ul>
    );
};

export default Menubar;
