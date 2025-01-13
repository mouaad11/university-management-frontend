export const sortData = (data: any[], field: string, order: 'asc' | 'desc') => {
    return data.sort((a, b) => {
      if (order === 'asc') {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });
  };
  
  export const searchData = (data: any[], searchTerm: string, fields: string[]) => {
    return data.filter(item => 
      fields.some(field => 
        item[field].toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };