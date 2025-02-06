import { useState, useEffect } from "react";

const Hooks = () => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        console.log("Count updated:", count);
    }, [count]);

    return { count, setCount };
};

export default Hooks;
