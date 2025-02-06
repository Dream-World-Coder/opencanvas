## Subhajit Gorai

### 2023ITB071

### C.O.A Lab: Assignment 2

---

> ### 1.Design behavioral model for the basic logic gates(AND, OR,NOT).

- ### <mark>OR Gate</mark>

<span style="text-decoration: underline;">design code</span>

```c
library IEEE;
use IEEE.std_logic_1164.all;

entity or_gate is
port(
 a: in std_logic;
 b: in std_logic;
 q: out std_logic);
end or_gate;

architecture behavioural of or_gate is
begin
 process(a,b) is
 begin
 if (a='0' and b='0') then q<='0';
 else q<='1';
 end if;
 end process;
end behavioural;
```

<span style="text-decoration: underline;">test bench code</span>

```c
library IEEE;
use IEEE.std_logic_1164.all;

entity testbench is
-- empty
end testbench;

architecture tb of testbench is

-- DUT component
component or_gate is
port(
 a: in std_logic;
 b: in std_logic;
 q: out std_logic);
end component;

signal a_in, b_in, q_out: std_logic;

begin

 -- Connect DUT
 DUT: or_gate port map(a_in, b_in, q_out);

 process
 begin
 a_in <= '0';
 b_in <= '0';
 wait for 1 ns;
 assert(q_out='0') report "Fail 0/0" severity error;

 a_in <= '0';
 b_in <= '1';
 wait for 1 ns;
 assert(q_out='1') report "Fail 0/1" severity error;

 a_in <= '1';
 b_in <= '0';
 wait for 1 ns;
 assert(q_out='1') report "Fail 1/0" severity error;

 a_in <= '1';
 b_in <= '1';
 wait for 1 ns;
 assert(q_out='1') report "Fail 1/1" severity error;

 -- Clear inputs
 a_in <= '0';
 b_in <= '0';

 assert false report "Test done." severity note;
 wait;
 end process;
end tb;
```

- ### <mark>AND Gate</mark>

<span style="text-decoration: underline;">design code</span>

```c
library IEEE;
use IEEE.std_logic_1164.all;

entity and_gate is
port(
 a: in std_logic;
 b: in std_logic;
 q: out std_logic);
end and_gate;

architecture behavioural of and_gate is
begin
 process(a,b) is
 begin
 if (a='1' and b='1') then q<='1';
 else q<='0';
 end if;
 end process;
end behavioural;
```

<span style="text-decoration: underline;">test bench code</span>

```c
library IEEE;
use IEEE.std_logic_1164.all;

entity testbench is
-- empty
end testbench;

architecture tb of testbench is

-- DUT component
component and_gate is
port(
 a: in std_logic;
 b: in std_logic;
 q: out std_logic);
end component;

signal a_in, b_in, q_out: std_logic;

begin

 -- Connect DUT
 DUT: and_gate port map(a_in, b_in, q_out);

 process
 begin
 a_in <= '0';
 b_in <= '0';
 wait for 1 ns;
 assert(q_out='0') report "Fail 0/0" severity error;

 a_in <= '0';
 b_in <= '1';
 wait for 1 ns;
 assert(q_out='0') report "Fail 0/1" severity error;

 a_in <= '1';
 b_in <= '0';
 wait for 1 ns;
 assert(q_out='0') report "Fail 1/0" severity error;

 a_in <= '1';
 b_in <= '1';
 wait for 1 ns;
 assert(q_out='1') report "Fail 1/1" severity error;

 -- Clear inputs
 a_in <= '0';
 b_in <= '0';

 assert false report "Test done." severity note;
 wait;
 end process;
end tb;
```

- ### <mark>NOT Gate</mark>

<span style="text-decoration: underline;">design code</span>

```c
library IEEE;
use IEEE.std_logic_1164.all;

entity not_gate is
port(
 a: in std_logic;
 q: out std_logic);
end not_gate;

architecture behavioural of not_gate is
begin
 process(a) is
 begin
 if (a='0') then q<='1';
 else q<='0';
 end if;
 end process;
end behavioural;
```

<span style="text-decoration: underline;">test bench code</span>

```c
library IEEE;
use IEEE.std_logic_1164.all;

entity testbench is
-- empty
end testbench;

architecture tb of testbench is

-- DUT component
component not_gate is
port(
 a: in std_logic;
 q: out std_logic);
end component;

signal a_in, q_out: std_logic;

begin

 -- Connect DUT
 DUT: not_gate port map(a_in, q_out);

 process
 begin
 a_in <= '0';
 wait for 1 ns;
 assert(q_out='1') report "Fail 0" severity error;

 a_in <= '1';
 wait for 1 ns;
 assert(q_out='0') report "Fail 1" severity error;

 -- Clear inputs
 a_in <= '0';

 assert false report "Test done." severity note;
 wait;
 end process;
end tb;
```

> ### 2.Design behavioral model for the universal logic gates(NAND, NOR).

- ### <mark>NAND Gate</mark>

<span style="text-decoration: underline;">design code</span>

```c
library IEEE;
use IEEE.std_logic_1164.all;

entity or_gate is
port(
 a: in std_logic;
 b: in std_logic;
 q: out std_logic);
end or_gate;

architecture behavioural of or_gate is
begin
 process(a,b) is
 begin
 if (a='0' and b='0') then q<='0';
 else q<='1';
 end if;
 end process;
end behavioural;
```

<span style="text-decoration: underline;">test bench code</span>

```c
library IEEE;
use IEEE.std_logic_1164.all;

entity testbench is
-- empty
end testbench;

architecture tb of testbench is

-- DUT component
component or_gate is
port(
 a: in std_logic;
 b: in std_logic;
 q: out std_logic);
end component;

signal a_in, b_in, q_out: std_logic;

begin

 -- Connect DUT
 DUT: or_gate port map(a_in, b_in, q_out);

 process
 begin
 a_in <= '0';
 b_in <= '0';
 wait for 1 ns;
 assert(q_out='0') report "Fail 0/0" severity error;

 a_in <= '0';
 b_in <= '1';
 wait for 1 ns;
 assert(q_out='1') report "Fail 0/1" severity error;

 a_in <= '1';
 b_in <= '0';
 wait for 1 ns;
 assert(q_out='1') report "Fail 1/0" severity error;

 a_in <= '1';
 b_in <= '1';
 wait for 1 ns;
 assert(q_out='1') report "Fail 1/1" severity error;

 -- Clear inputs
 a_in <= '0';
 b_in <= '0';

 assert false report "Test done." severity note;
 wait;
 end process;
end tb;
```

- ### <mark>NOR Gate</mark>

<span style="text-decoration: underline;">design code</span>

```c
library IEEE;
use IEEE.std_logic_1164.all;

entity or_gate is
port(
 a: in std_logic;
 b: in std_logic;
 q: out std_logic);
end or_gate;

architecture behavioural of or_gate is
begin
 process(a,b) is
 begin
 if (a='0' and b='0') then q<='0';
 else q<='1';
 end if;
 end process;
end behavioural;
```

<span style="text-decoration: underline;">test bench code</span>

```c
library IEEE;
use IEEE.std_logic_1164.all;

entity testbench is
-- empty
end testbench;

architecture tb of testbench is

-- DUT component
component or_gate is
port(
 a: in std_logic;
 b: in std_logic;
 q: out std_logic);
end component;

signal a_in, b_in, q_out: std_logic;

begin

 -- Connect DUT
 DUT: or_gate port map(a_in, b_in, q_out);

 process
 begin
 a_in <= '0';
 b_in <= '0';
 wait for 1 ns;
 assert(q_out='0') report "Fail 0/0" severity error;

 a_in <= '0';
 b_in <= '1';
 wait for 1 ns;
 assert(q_out='1') report "Fail 0/1" severity error;

 a_in <= '1';
 b_in <= '0';
 wait for 1 ns;
 assert(q_out='1') report "Fail 1/0" severity error;

 a_in <= '1';
 b_in <= '1';
 wait for 1 ns;
 assert(q_out='1') report "Fail 1/1" severity error;

 -- Clear inputs
 a_in <= '0';
 b_in <= '0';

 assert false report "Test done." severity note;
 wait;
 end process;
end tb;
```

> ### 3.Design behavioral model for the logic gates(XOR, XNOR).

- ### <mark>XOR Gate</mark>

<span style="text-decoration: underline;">design code</span>

```c
library IEEE;
use IEEE.std_logic_1164.all;

entity or_gate is
port(
 a: in std_logic;
 b: in std_logic;
 q: out std_logic);
end or_gate;

architecture behavioural of or_gate is
begin
 process(a,b) is
 begin
 if (a='0' and b='0') then q<='0';
 else q<='1';
 end if;
 end process;
end behavioural;
```

<span style="text-decoration: underline;">test bench code</span>

```c
library IEEE;
use IEEE.std_logic_1164.all;

entity testbench is
-- empty
end testbench;

architecture tb of testbench is

-- DUT component
component or_gate is
port(
 a: in std_logic;
 b: in std_logic;
 q: out std_logic);
end component;

signal a_in, b_in, q_out: std_logic;

begin

 -- Connect DUT
 DUT: or_gate port map(a_in, b_in, q_out);

 process
 begin
 a_in <= '0';
 b_in <= '0';
 wait for 1 ns;
 assert(q_out='0') report "Fail 0/0" severity error;

 a_in <= '0';
 b_in <= '1';
 wait for 1 ns;
 assert(q_out='1') report "Fail 0/1" severity error;

 a_in <= '1';
 b_in <= '0';
 wait for 1 ns;
 assert(q_out='1') report "Fail 1/0" severity error;

 a_in <= '1';
 b_in <= '1';
 wait for 1 ns;
 assert(q_out='1') report "Fail 1/1" severity error;

 -- Clear inputs
 a_in <= '0';
 b_in <= '0';

 assert false report "Test done." severity note;
 wait;
 end process;
end tb;
```

- ### <mark>XNOR Gate</mark>

<span style="text-decoration: underline;">design code</span>

```c
library IEEE;
use IEEE.std_logic_1164.all;

entity or_gate is
port(
 a: in std_logic;
 b: in std_logic;
 q: out std_logic);
end or_gate;

architecture behavioural of or_gate is
begin
 process(a,b) is
 begin
 if (a='0' and b='0') then q<='0';
 else q<='1';
 end if;
 end process;
end behavioural;
```

<span style="text-decoration: underline;">test bench code</span>

```c
library IEEE;
use IEEE.std_logic_1164.all;

entity testbench is
-- empty
end testbench;

architecture tb of testbench is

-- DUT component
component or_gate is
port(
 a: in std_logic;
 b: in std_logic;
 q: out std_logic);
end component;

signal a_in, b_in, q_out: std_logic;

begin

 -- Connect DUT
 DUT: or_gate port map(a_in, b_in, q_out);

 process
 begin
 a_in <= '0';
 b_in <= '0';
 wait for 1 ns;
 assert(q_out='0') report "Fail 0/0" severity error;

 a_in <= '0';
 b_in <= '1';
 wait for 1 ns;
 assert(q_out='1') report "Fail 0/1" severity error;

 a_in <= '1';
 b_in <= '0';
 wait for 1 ns;
 assert(q_out='1') report "Fail 1/0" severity error;

 a_in <= '1';
 b_in <= '1';
 wait for 1 ns;
 assert(q_out='1') report "Fail 1/1" severity error;

 -- Clear inputs
 a_in <= '0';
 b_in <= '0';

 assert false report "Test done." severity note;
 wait;
 end process;
end tb;
```
