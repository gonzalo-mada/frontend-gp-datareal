export function groupDataTipoPrograma(data: any[]): any[]{
    const groupedData = data.reduce((acc, item) => {
        const category = item.Categoria;
        const existingGroup = acc.find((group: { label: any; }) => group.label === category?.Descripcion_categoria)

        if (existingGroup) {
          existingGroup.items.push({
            label: item.Descripcion_tp,
            value: item.Cod_tipoPrograma,
            parentLabel: category.Descripcion_categoria
          });
        }else{
          acc.push({
            label: category.Descripcion_categoria,
            value: category.Cod_CategoriaTP, 
            items: [{
              label: item.Descripcion_tp,
              value: item.Cod_tipoPrograma,
              parentLabel: category.Descripcion_categoria
            }]
          })
        }
        return acc;
      }, []);
      groupedData.sort((a:any, b:any) => Number(a.value) - Number(b.value));

      return groupedData;
}

export function groupDataUnidadesAcademicas(data: any[]): any[]{
    const groupedData = data.reduce((acc, item) => {
        const category = item.Facultad;
        const existingGroup = acc.find((group: { label: any; }) => group.label === category?.Descripcion_facu)

        if (existingGroup) {
          existingGroup.items.push({
            label: item.Descripcion_ua,
            value: item,
            parentLabel: category.Descripcion_facu
          });
        }else{
          acc.push({
            label: category.Descripcion_facu,
            value: category.Cod_facultad, 
            items: [{
              label: item.Descripcion_ua,
              value: item,
              parentLabel: category.Descripcion_facu
            }]
          })
        }
        return acc;
      }, []);
      groupedData.sort((a:any, b:any) => Number(a.value) - Number(b.value));

      return groupedData;
}