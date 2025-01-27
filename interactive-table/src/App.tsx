import React, { useEffect, useState } from 'react';
import AdvancedTable from './components/AdvancedTable';
import { ColumnDef } from '@tanstack/react-table';

interface UserData {
  name: string;
  age: number;
  country: string;
  city: string;
}

const App: React.FC = () => {
  const [data, setData] = useState<UserData[]>([]);

  const columns: ColumnDef<UserData>[] = React.useMemo(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'age', header: 'Age' },
      { accessorKey: 'city', header: 'City' },
      { accessorKey: 'country', header: 'Country' },
    ],
    []
  );

  useEffect(() => {
    fetch('https://dummyjson.com/users')
      .then((response) => response.json())
      .then((json) => {
        const formattedData = json.users.map((user: any) => ({
          name: `${user.firstName} ${user.lastName}`,
          age: user.age,
          city: user.address.city,
          country: user.address.country,
        }));
        setData(formattedData);
      });
  }, []);

  return (
    <div className="App">
      <AdvancedTable columns={columns} data={data} />
    </div>
  );
};

export default App;
