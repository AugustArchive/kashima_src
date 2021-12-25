/**
 * Vuepress Configuration
 */
module.exports = {
  description: 'Documentation site for Kashima',
  title: 'Kashima | Documentation',
  port: 4040,
  themeConfig: {
    sidebar: {
      '/libraries/': [
        ['types', '@kashima-org/types'],
        ['extract-tar', '@kashima-org/tar']
      ],
      '/api/': [
        ['themes', 'Themes API'],
        
      ]
    }
  }
};

/*
     sidebar: [
        '/',
        {
            title: 'Guide',
            collapsable: false,
            children: [ 
            ['/guide/Frontend','Frontend'],
            ['/guide/Backend' , 'Backend' ]

        },
*/